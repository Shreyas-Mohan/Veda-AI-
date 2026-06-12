type QuestionRequest = {
    type: string;
    count: number;
    marks: number;
};

type ReferenceFile = {
    name: string;
    mimeType?: string;
    kind?: 'pdf' | 'image' | 'text';
    content?: string;
    data?: string;
    images?: Array<{
        label: string;
        mimeType: string;
        data: string;
    }>;
};

type FormData = {
    subject?: string;
    additionalInstructions?: string;
    totalMarks?: number;
    totalQuestions?: number;
    questions: QuestionRequest[];
    referenceFile?: ReferenceFile;
};

export const generateQuestionPaper = async (formData: FormData): Promise<string> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn('[Gemini Service] GEMINI_API_KEY is not defined. Falling back to dynamic Mock generator.');
        return generateMockPaper(formData);
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
        
        const questionPrompt = formData.questions.map((q) => 
            `- Type: ${q.type}, Quantity: ${q.count}, Marks per Question: ${q.marks}`
        ).join('\n');

        const referenceNotes = formData.referenceFile && formData.referenceFile.content 
            ? `\nReference notes to base the questions on:\n"""\n${formData.referenceFile.content}\n"""`
            : '';

        const imageInstruction = formData.referenceFile?.kind === 'image' || (formData.referenceFile?.images?.length || 0) > 0
            ? `\nUploaded visual material is attached. Read all visible text, diagrams, tables, formulas, screenshots, and educational context from it. Use that visual context as source material for the questions.`
            : '';

        const systemInstruction = `You are an expert assessment creator. Your task is to generate a high-quality question paper in strict JSON format. 
The output MUST match this JSON structure:
{
  "sections": [
    {
      "title": "Section Title (e.g. Section A: Objective)",
      "instructions": "Section instructions",
      "questions": [
        {
          "text": "The full text of the question. CRITICAL: If the question type is 'Multiple Choice Questions', you MUST include the question text followed by 4 choices labeled A), B), C), D) on separate lines (e.g. 'What is the capital of France?\\nA) Paris\\nB) London\\nC) Berlin\\nD) Rome').",
          "difficulty": "Easy" or "Moderate" or "Challenging",
          "marks": 5, // number
          "type": "Multiple Choice Questions" or "Short Questions" or "Long Questions" or "Numerical Problems"
        }
      ]
    }
  ]
}
Do NOT include any explanations, markdown code blocks (like \`\`\`json), or additional text outside the JSON. Return only the valid raw JSON object.`;

        const userPrompt = `Generate a question paper for the subject "${formData.subject || 'General Knowledge'}".
Additional instructions: ${formData.additionalInstructions || 'None'}
Total marks required: ${formData.totalMarks}
Total questions: ${formData.totalQuestions}

Generate the following sections matching these question requirements:
${questionPrompt}
${referenceNotes}
${imageInstruction}`;

        const parts: any[] = [{
            text: `${systemInstruction}\n\n${userPrompt}`
        }];

        if (formData.referenceFile?.kind === 'image' && formData.referenceFile.data && formData.referenceFile.mimeType) {
            parts.push({
                inlineData: {
                    mimeType: formData.referenceFile.mimeType,
                    data: formData.referenceFile.data
                }
            });
        }

        formData.referenceFile?.images?.forEach((image) => {
            parts.push({ text: `Visual context from ${image.label}:` });
            parts.push({
                inlineData: {
                    mimeType: image.mimeType,
                    data: image.data
                }
            });
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts
                }],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API returned status ${response.status}: ${await response.text()}`);
        }

        const responseData = await response.json();
        const generatedText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) {
            throw new Error('Invalid response structure from Gemini API');
        }

        let parsed: any;
        try {
            parsed = JSON.parse(generatedText.trim());
            if (parsed && Array.isArray(parsed.sections)) {
                parsed.sections.forEach((section: any) => {
                    if (section && Array.isArray(section.questions)) {
                        section.questions.forEach((q: any) => {
                            if (q && typeof q.difficulty === 'string') {
                                const diff = q.difficulty.trim().toLowerCase();
                                if (diff === 'medium') {
                                    q.difficulty = 'Moderate';
                                } else if (diff === 'hard' || diff === 'challenging') {
                                    q.difficulty = 'Hard';
                                }
                            }
                        });
                    }
                });
            }
        } catch (e) {
            const sanitized = generatedText.replace(/"difficulty"\s*:\s*"(Medium|medium)"/g, '"difficulty": "Moderate"');
            return sanitized.trim();
        }

        return JSON.stringify(parsed);
        
    } catch (error: any) {
        console.error('[Gemini API Error] Failed to generate:', error.message);
        console.warn('Falling back to dynamic Mock generator.');
        return generateMockPaper(formData);
    }
};

const generateMockPaper = async (formData: FormData): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const referenceContext = formData.referenceFile?.content
                ? ` Based on uploaded reference "${formData.referenceFile.name}".`
                : formData.referenceFile?.kind === 'image'
                    ? ` Based on uploaded image "${formData.referenceFile.name}".`
                    : '';

            const mockOutput = {
                sections: formData.questions.map((q, index: number) => ({
                    title: `Section ${String.fromCharCode(65 + index)}: ${q.type}`,
                    instructions: `Attempt all questions in this section. Each question is worth ${q.marks} marks.`,
                    questions: Array.from({ length: q.count }).map((_, qIdx) => ({
                        text: `Sample generated ${q.type.toLowerCase()} question ${qIdx + 1} regarding ${formData.subject || 'General Knowledge'}.${referenceContext}${formData.additionalInstructions ? ` (Instruction: ${formData.additionalInstructions})` : ''}`,
                        difficulty: qIdx % 3 === 0 ? "Easy" : qIdx % 3 === 1 ? "Moderate" : "Challenging",
                        marks: q.marks,
                        type: q.type
                    }))
                }))
            };
            resolve(JSON.stringify(mockOutput));
        }, 3000);
    });
};
