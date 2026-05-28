"use client";

import { ChangeEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, CalendarDays, Loader2, Mic, Minus, Plus, UploadCloud, X } from 'lucide-react';
import { API_BASE_URL } from '@/config';
import { useAssignmentStore } from '@/store/useAssignmentStore';

const QUESTION_TYPES = [
  'Multiple Choice Questions',
  'Short Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Long Questions',
];

export default function CreateAssignment() {
  const router = useRouter();
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    dueDate,
    subject,
    className,
    questionConfigs,
    additionalInfo,
    setDueDate,
    setSubject,
    setClassName,
    addQuestionConfig,
    removeQuestionConfig,
    updateQuestionConfig,
    setAdditionalInfo,
    getTotalQuestions,
    getTotalMarks,
  } = useAssignmentStore();

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setReferenceFile(file);
  };

  const generateAssignment = async () => {
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', `Quiz on ${subject || 'General Knowledge'}`);
      payload.append('subject', subject);
      payload.append('className', className);
      payload.append('dueDate', dueDate || new Date().toISOString());
      payload.append('totalMarks', String(getTotalMarks()));
      payload.append('totalQuestions', String(getTotalQuestions()));
      payload.append('questions', JSON.stringify(questionConfigs));
      payload.append('additionalInstructions', additionalInfo);
      if (referenceFile) {
        payload.append('referenceFile', referenceFile);
      }

      const response = await axios.post(`${API_BASE_URL}/api/assignments`, payload);

      toast.success('Assessment generation started');
      router.push(`/assignment/${response.data.assignmentId}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to start assessment generation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[940px] py-4">
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-1.5 h-3.5 w-3.5 rounded-full bg-[#67d18c] ring-4 ring-[#67d18c]/25" />
        <div>
          <h1 className="text-lg font-black text-[#2d2d2d]">Create Assignment</h1>
          <p className="text-xs font-medium text-[#999]">Set up a new assignment for your students</p>
        </div>
      </div>

      <div className="mx-auto mb-5 h-1 max-w-[640px] rounded-full bg-[#d8d8d8]">
        <div className="h-full w-1/2 rounded-full bg-[#5c5c5c]" />
      </div>

      <section className="mx-auto max-w-[720px] rounded-[28px] bg-[#f4f4f4] p-7 shadow-sm">
        <div className="mb-6">
          <h2 className="text-base font-black text-[#292929]">Assignment Details</h2>
          <p className="text-xs font-medium text-[#9a9a9a]">Basic information about your assignment</p>
        </div>

        <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#bdbdbd] bg-white/70 px-5 text-center transition hover:bg-white">
          <UploadCloud size={24} className="mb-5 text-[#242424]" />
          <span className="text-sm font-semibold text-[#242424]">{referenceFile?.name || 'Choose a file or drag and drop it here'}</span>
          <span className="mt-1 text-xs font-medium text-[#aaa]">PDF, JPEG, PNG, WEBP, or TXT up to 10MB</span>
          <span className="mt-4 rounded-full bg-[#eeeeee] px-5 py-2 text-xs font-bold text-[#333]">Browse Files</span>
          <input type="file" accept="application/pdf,image/png,image/jpeg,image/webp,text/plain" onChange={handleFile} className="hidden" />
        </label>
        <p className="mt-3 text-center text-xs font-medium text-[#8f8f8f]">Upload a PDF, notes file, screenshot, or document image for AI context</p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-black text-[#2d2d2d]">Subject</label>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="h-11 w-full rounded-full border border-[#dedede] bg-white px-4 text-sm font-semibold text-[#2d2d2d] outline-none transition focus:border-[#222]"
              placeholder="Science"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-black text-[#2d2d2d]">Class (e.g. 5th, 8th)</label>
            <input
              value={className}
              onChange={(event) => setClassName(event.target.value)}
              className="h-11 w-full rounded-full border border-[#dedede] bg-white px-4 text-sm font-semibold text-[#2d2d2d] outline-none transition focus:border-[#222]"
              placeholder="5th"
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-xs font-black text-[#2d2d2d]">Due Date</label>
          <div className="relative">
            <input
              type="date"
              value={dueDate}
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              onChange={(event) => setDueDate(event.target.value)}
              className="h-11 w-full cursor-pointer rounded-full border border-[#dedede] bg-white px-4 pr-11 text-sm font-semibold text-[#2d2d2d] outline-none transition focus:border-[#222] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:bottom-0 [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
            />
            <CalendarDays size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#555]" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_110px_90px] gap-3 px-1 text-xs font-black text-[#2d2d2d]">
          <span>Question Type</span>
          <span className="text-center">No. of Questions</span>
          <span className="text-center">Marks</span>
        </div>

        <div className="mt-3 space-y-3">
          {questionConfigs.map((config) => (
            <div key={config.id} className="grid grid-cols-[1fr_24px_110px_90px] items-center gap-3">
              <select
                value={config.type}
                onChange={(event) => updateQuestionConfig(config.id, 'type', event.target.value)}
                className="h-11 min-w-0 rounded-full border-0 bg-white px-4 text-xs font-semibold text-[#2d2d2d] outline-none"
              >
                {QUESTION_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <button
                onClick={() => removeQuestionConfig(config.id)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[#555] transition hover:bg-white"
                aria-label="Remove question type"
              >
                <X size={14} />
              </button>

              <Stepper
                value={config.count}
                onMinus={() => updateQuestionConfig(config.id, 'count', config.count - 1)}
                onPlus={() => updateQuestionConfig(config.id, 'count', config.count + 1)}
              />

              <Stepper
                value={config.marks}
                onMinus={() => updateQuestionConfig(config.id, 'marks', config.marks - 1)}
                onPlus={() => updateQuestionConfig(config.id, 'marks', config.marks + 1)}
              />
            </div>
          ))}
        </div>

        <button
          onClick={addQuestionConfig}
          className="mt-4 inline-flex items-center gap-2 text-xs font-black text-[#2d2d2d]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#242424] text-white">
            <Plus size={17} />
          </span>
          Add Question Type
        </button>

        <div className="mt-4 text-right text-sm font-semibold text-[#555]">
          <p>Total Questions: {getTotalQuestions()}</p>
          <p>Total Marks: {getTotalMarks()}</p>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-xs font-black text-[#2d2d2d]">Additional Information (For better output)</label>
          <div className="relative">
            <textarea
              value={additionalInfo}
              onChange={(event) => setAdditionalInfo(event.target.value)}
              placeholder="e.g Generate a question paper for 3 hour exam duration..."
              className="min-h-[92px] w-full resize-none rounded-2xl border border-dashed border-[#d4d4d4] bg-white/65 px-4 py-4 pr-12 text-xs font-medium text-[#2d2d2d] outline-none transition focus:border-[#222]"
            />
            <button className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#333] shadow-sm" aria-label="Voice input">
              <Mic size={14} />
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 flex max-w-[720px] items-center justify-between">
        <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-[#2d2d2d] shadow-sm transition hover:-translate-y-0.5">
          <ArrowLeft size={16} />
          Previous
        </Link>
        <button
          onClick={generateAssignment}
          disabled={submitting}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-[#111] px-6 text-sm font-bold text-white shadow-lg shadow-black/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
          Next
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function Stepper({ value, onMinus, onPlus }: { value: number; onMinus: () => void; onPlus: () => void }) {
  return (
    <div className="flex h-10 items-center justify-between rounded-full bg-white px-2 text-xs font-black text-[#2d2d2d]">
      <button onClick={onMinus} className="flex h-7 w-7 items-center justify-center rounded-full text-[#aaa] hover:bg-[#f2f2f2]" aria-label="Decrease">
        <Minus size={13} />
      </button>
      <span>{value}</span>
      <button onClick={onPlus} className="flex h-7 w-7 items-center justify-center rounded-full text-[#aaa] hover:bg-[#f2f2f2]" aria-label="Increase">
        <Plus size={13} />
      </button>
    </div>
  );
}
