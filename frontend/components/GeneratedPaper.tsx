'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '../store/useSocket';
import { useAssignmentStore } from '../store/useAssignmentStore';

interface GeneratedPaperProps {
  assignmentId: string;
}

interface Question {
  question: string;
  difficulty: string;
  marks: number;
}

interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

interface QuestionPaper {
  sections: Section[];
}

export default function GeneratedPaper({ assignmentId }: GeneratedPaperProps) {
  const { status, setAssignmentId } = useAssignmentStore();
  const socket = useSocket();
  const [paper, setPaper] = useState<QuestionPaper | null>(null);

  useEffect(() => {
    setAssignmentId(assignmentId);
  }, [assignmentId, setAssignmentId]);

  useEffect(() => {
    if (status === 'completed') {
      fetch(`http://localhost:5000/api/papers/${assignmentId}`)
        .then(res => res.json())
        .then(data => setPaper(data))
        .catch(console.error);
    }
  }, [status, assignmentId]);

  if (status === 'pending' || status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <div className="relative flex justify-center items-center">
            <div className="absolute animate-ping h-24 w-24 rounded-full bg-blue-100 opacity-75"></div>
            <div className="relative bg-white rounded-full p-4 shadow-lg border border-blue-50">
               <svg className="w-8 h-8 text-blue-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
        </div>
        <h3 className="mt-8 text-xl font-bold text-gray-900 tracking-tight">Generating Question Paper</h3>
        <p className="mt-2 text-sm text-gray-500 max-w-sm text-center leading-relaxed">Our AI is analyzing your requirements and crafting the perfect assessment. This might take a few moments.</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Generation Failed</h3>
        <p className="text-gray-500">Something went wrong while generating the assessment. Please try again.</p>
      </div>
    );
  }

  if (!paper) return null;

  return (
    <div className="max-w-[850px] mx-auto bg-white shadow-[0_2px_15px_rgb(0,0,0,0.06)] rounded-xl overflow-hidden print:shadow-none print:rounded-none">
      
      {/* Action Bar */}
      <div className="bg-white px-8 py-5 border-b border-gray-100 flex justify-between items-center print:hidden sticky top-0 z-10">
        <button className="text-sm text-gray-500 hover:text-gray-900 font-medium flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Create
        </button>
        <div className="space-x-4 flex items-center">
            <button 
                onClick={() => window.location.reload()}
                className="text-sm font-medium px-5 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
                Regenerate
            </button>
            <button 
                onClick={() => window.print()}
                className="text-sm font-medium px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all"
            >
                Download as PDF
            </button>
        </div>
      </div>

      {/* Paper Content */}
      <div className="p-12 space-y-12 pb-24 bg-white">
        
        {/* Header Summary */}
        <div className="text-center space-y-3 border-b-2 border-black pb-10">
          <h1 className="text-3xl font-bold uppercase tracking-widest text-black">Assessment Test</h1>
          <p className="text-gray-500 font-medium">Artificial Intelligence Generated Assessment</p>
        </div>

        {/* Student Info */}
        <div className="grid grid-cols-2 gap-x-16 gap-y-8 text-[15px] font-medium text-gray-800">
          <div className="flex items-end">
            <span className="shrink-0 mr-3">Candidate Name:</span>
            <div className="border-b border-gray-400 w-full mb-1"></div>
          </div>
          <div className="flex items-end">
            <span className="shrink-0 mr-3">Roll No:</span>
            <div className="border-b border-gray-400 w-full mb-1"></div>
          </div>
          <div className="flex items-end">
            <span className="shrink-0 mr-3">Section:</span>
            <div className="border-b border-gray-400 w-full mb-1"></div>
          </div>
          <div className="flex items-end">
            <span className="shrink-0 mr-3">Date:</span>
            <div className="border-b border-gray-400 w-full mb-1"></div>
          </div>
        </div>

        {/* Dynamic Sections */}
        <div className="space-y-12 pt-4">
        {paper.sections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg pl-6 border-l-4 border-l-blue-600">
              <h2 className="text-xl font-bold tracking-tight text-gray-900">{sec.title}</h2>
              <p className="text-sm text-gray-600 mt-1.5 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {sec.instruction}
              </p>
            </div>

            <div className="space-y-8 pl-1">
              {sec.questions.map((q, qIdx) => (
                <div key={qIdx} className="flex gap-4">
                  <span className="font-semibold text-gray-900 mt-0.5">{qIdx + 1}.</span>
                  <div className="flex-1">
                    <p className="text-gray-800 leading-relaxed mb-3 text-[15px]">{q.question}</p>
                    <div className="flex gap-3 items-center">
                      <span className={`text-[11px] px-2.5 py-1 rounded-md font-semibold tracking-wide uppercase ${
                        q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        q.difficulty === 'Moderate' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="text-sm font-semibold text-gray-400">[{q.marks} Marks]</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
        
      </div>
    </div>
  );
}