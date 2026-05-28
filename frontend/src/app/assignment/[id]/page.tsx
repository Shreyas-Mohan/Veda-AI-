"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { ChevronLeft, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/config';

type Question = {
  text: string;
  difficulty: string;
  marks: number;
  type: string;
};

type Section = {
  title: string;
  instructions?: string;
  questions: Question[];
};

type Assignment = {
  status?: string;
  subject?: string;
  className?: string;
  totalMarks?: number;
  questionPapers?: Array<{
    sections?: Section[];
  }>;
};

export default function AssignmentOutput() {
  const params = useParams();
  const id = params.id;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
 
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
 
    const fetchAssignment = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/assignments/${id}`);
        const data = response.data;
        setAssignment(data);
        setInitialLoading(false);
 
        if (data.status === 'completed' || data.status === 'failed') {
          setLoading(false);
          if (intervalId) clearInterval(intervalId);
        }
      } catch (err) {
        setError('Failed to load the assignment. Is the backend running?');
        console.error(err);
        setInitialLoading(false);
        setLoading(false);
        if (intervalId) clearInterval(intervalId);
      }
    };
 
    if (id) {
      fetchAssignment();
      intervalId = setInterval(fetchAssignment, 1500);
    }
 
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id]);
 
  if (initialLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
        <div className="flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-black text-[#2d2d2d] shadow-sm">
          <Loader2 size={18} className="animate-spin" />
          Loading assessment from database...
        </div>
      </div>
    );
  }
 
  if (loading && assignment?.status === 'pending') {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eeeeee] text-[#222]">
            <Loader2 size={30} className="animate-spin" />
          </div>
          <h1 className="text-2xl font-black text-[#2d2d2d]">Crafting your assessment</h1>
          <p className="mt-3 text-sm leading-6 text-[#777]">
            AI is preparing the paper layout and questions. This usually takes about 10 seconds.
          </p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#eeeeee]">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-[#222]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-16 text-center">
        <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ChevronLeft size={28} />
          </div>
          <h2 className="text-2xl font-black text-[#2d2d2d]">Something went wrong</h2>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[#777]">
            {error || "Assignment not found or still processing."}
          </p>
          <Link href="/" className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#111] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5">
            <ChevronLeft size={16} />
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  const sections = assignment.questionPapers?.[0]?.sections || [];

  return (
    <div className="py-2 print:py-0">
      <section className="mb-3 rounded-[28px] bg-[#242424] p-7 text-white print:hidden">
        <h1 className="max-w-3xl text-base font-black leading-6">
          Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 8 {assignment.subject || 'Science'} classes on the NCERT chapters:
        </h1>
        <button
          onClick={() => window.print()}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-[#242424]"
        >
          <Download size={16} />
          Download as PDF
        </button>
      </section>

      <article className="mx-auto mb-12 max-w-5xl overflow-hidden rounded-[28px] bg-white text-[#2d2d2d] shadow-sm print:mb-0 print:max-w-none print:rounded-none print:shadow-none">
        <div className="p-8 md:p-12 print:p-8">
          <header className="pb-7 text-center">
            <h1 className="text-2xl font-black text-[#2d2d2d]">Delhi Public School, Sector-4, Bokaro</h1>
            <p className="mt-2 text-base font-black">Subject: {assignment.subject || 'General Knowledge'}</p>
            <p className="mt-1 text-base font-black">Class: {assignment.className || '5th'}</p>
          </header>

          <div className="mb-7 flex items-center justify-between gap-4 text-sm font-black">
            <span>Time Allowed: 45 minutes</span>
            <span>Maximum Marks: {assignment.totalMarks || 40}</span>
          </div>

          <p className="mb-6 text-sm font-black">All questions are compulsory unless stated otherwise.</p>

          <div className="mb-7 space-y-1 text-sm font-semibold">
            <p>Name: ____________________</p>
            <p>Roll Number: ______________</p>
            <p>Class: {assignment.className || '5th'} Section: _________</p>
          </div>

          <div className="space-y-10">
            {sections.map((section: Section, sIdx: number) => (
              <section key={sIdx}>
                <h2 className="mb-6 text-center text-lg font-black">Section {String.fromCharCode(65 + sIdx)}</h2>
                <h3 className="text-sm font-black">{section.title.replace(/^Section [A-Z]:\s*/i, '')}</h3>
                {section.instructions && <p className="mb-6 mt-1 text-xs italic text-[#555]">{section.instructions}</p>}

                <ol className="space-y-4">
                  {section.questions.map((q: Question, qIdx: number) => (
                    <li key={qIdx} className="grid grid-cols-[24px_1fr] gap-1 text-sm leading-6">
                      <span>{qIdx + 1}.</span>
                      <p>
                        <span>[{q.difficulty}] </span>
                        {q.text} <span>[{q.marks} Marks]</span>
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>

          <footer className="mt-8">
            <p className="text-sm font-black">End of Question Paper</p>
          </footer>
        </div>
      </article>

      <div className="mt-4 flex justify-center print:hidden">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#2d2d2d] shadow-sm">
          <ChevronLeft size={16} />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
