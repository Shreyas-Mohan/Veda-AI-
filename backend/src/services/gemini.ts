import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || '',
  baseURL: 'https://api.groq.com/openai/v1',
});

export const generateQuestionPaper = async (prompt: string) => {
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  
  const detailedPrompt = `
  Generate a question paper based on these requirements:
  ${prompt}
  
  Return ONLY a raw JSON array of sections. Do not use markdown blocks like \`\`\`json. Each section must have:
  - title (string)
  - instruction (string)
  - questions (array of objects with 'question' (string), 'difficulty' ('Easy', 'Moderate', 'Hard'), 'marks' (number))
  `;

  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'user',
        content: detailedPrompt,
      },
    ],
    temperature: 0.3,
  });

  const responseText = response.choices[0]?.message?.content || '';
  const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanedText);

  if (Array.isArray(parsed)) {
    parsed.forEach((section: any) => {
      if (section && Array.isArray(section.questions)) {
        section.questions.forEach((q: any) => {
          if (q && (q.difficulty === 'Medium' || q.difficulty === 'medium')) {
            q.difficulty = 'Moderate';
          }
        });
      }
    });
  }

  return parsed;
};