"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Filter, Loader2, MoreVertical, Plus, Search, XCircle } from 'lucide-react';
import { API_BASE_URL } from '@/config';

type AssignmentSummary = {
  _id: string;
  title?: string;
  subject?: string;
  dueDate?: string;
  createdAt?: string;
  status?: string;
  totalMarks?: number;
  totalQuestions?: number;
};

function formatDate(value?: string) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return new Intl.DateTimeFormat('en-GB').format(date).replace(/\//g, '-');
}

export default function AssignmentsDashboard() {
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'dueDate' | 'subject'>('newest');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/assignments`);
        setAssignments(response.data);
      } catch (err) {
        console.error(err);
        setError('Could not load your assignments. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const visibleAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();
    
    // Sort assignments
    const sorted = [...assignments].sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === 'oldest') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      }
      if (sortBy === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 9999999999999;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 9999999999999;
        return dateA - dateB;
      }
      if (sortBy === 'subject') {
        const subjectA = a.subject || '';
        const subjectB = b.subject || '';
        return subjectA.localeCompare(subjectB);
      }
      return 0;
    });

    if (!query) return sorted;

    return sorted.filter((assignment) => {
      return `${assignment.title || ''} ${assignment.subject || ''} ${assignment.status || ''}`.toLowerCase().includes(query);
    });
  }, [assignments, search, sortBy]);

  const hasAssignments = visibleAssignments.length > 0;

  return (
    <div className="py-4">
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-1.5 h-3.5 w-3.5 rounded-full bg-[#67d18c] ring-4 ring-[#67d18c]/25" />
        <div>
          <h1 className="text-2xl font-black text-[#2d2d2d]">Assignments</h1>
          <p className="mt-1 text-base font-medium text-[#999]">Manage and create assignments for your classes.</p>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-4 rounded-[28px] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <label htmlFor="sort-select" className="inline-flex items-center gap-3 text-base font-black text-[#aaa]">
            <Filter size={22} />
            Sort By:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-[#c9c9c9] bg-white px-3 py-1.5 text-sm font-bold text-[#2d2d2d] outline-none transition focus:border-[#222]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="dueDate">Due Date</option>
            <option value="subject">Subject</option>
          </select>
        </div>
        <div className="flex h-14 w-full items-center gap-3 rounded-full border border-[#c9c9c9] bg-white px-5 sm:max-w-[420px]">
          <Search size={24} className="text-[#aaa]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Assignment"
            className="min-w-0 flex-1 bg-transparent text-base font-semibold text-[#2d2d2d] outline-none placeholder:text-[#aaa]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[55vh] items-center justify-center">
          <div className="flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-black text-[#2d2d2d] shadow-sm">
            <Loader2 size={18} className="animate-spin" />
            Loading assignments
          </div>
        </div>
      ) : error ? (
        <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white">
            <XCircle size={42} className="text-[#ff3b3b]" />
          </div>
          <h2 className="text-2xl font-black text-[#2d2d2d]">Unable to load assignments</h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-[#777]">{error}</p>
        </div>
      ) : hasAssignments ? (
        <>
          <div className="grid gap-5 xl:grid-cols-2">
            {visibleAssignments.map((assignment) => (
              <article key={assignment._id} className="relative min-h-[170px] rounded-[28px] bg-white p-8 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-[#2d2d2d] underline decoration-[#bdbdbd] decoration-2 underline-offset-4">
                      {assignment.title || `Quiz on ${assignment.subject || 'General Knowledge'}`}
                    </h2>
                    <p className="mt-2 text-sm font-semibold capitalize text-[#888]">
                      {assignment.status || 'pending'}
                      {typeof assignment.totalQuestions === 'number' ? ` • ${assignment.totalQuestions} questions` : ''}
                      {typeof assignment.totalMarks === 'number' ? ` • ${assignment.totalMarks} marks` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setMenuOpen(menuOpen === assignment._id ? null : assignment._id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#aaa] hover:bg-[#f2f2f2]"
                    aria-label="Assignment menu"
                  >
                    <MoreVertical size={24} />
                  </button>
                </div>

                <div className="mt-14 flex flex-col gap-2 text-base text-[#777] sm:flex-row sm:items-center sm:justify-between">
                  <p><span className="font-black text-[#2d2d2d]">Assigned on :</span> {formatDate(assignment.createdAt)}</p>
                  <p><span className="font-black text-[#2d2d2d]">Due :</span> {formatDate(assignment.dueDate)}</p>
                </div>

                {menuOpen === assignment._id && (
                  <div className="absolute right-16 top-16 z-10 w-44 rounded-2xl bg-white p-3 shadow-2xl shadow-black/15">
                    <Link href={`/assignment/${assignment._id}`} className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#2d2d2d] hover:bg-[#f4f4f4]">
                      View Assignment
                    </Link>
                    <button className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 hover:bg-[#f4f4f4]">
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="sticky bottom-5 mt-5 flex justify-center">
            <Link href="/create" className="inline-flex h-14 items-center gap-3 rounded-full bg-[#111] px-8 text-base font-bold text-white shadow-xl shadow-black/20 transition hover:-translate-y-0.5">
              <Plus size={22} />
              Create Assignment
            </Link>
          </div>
        </>
      ) : (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="mb-8 flex h-56 w-56 items-center justify-center rounded-full bg-white/60">
            <Plus size={80} className="text-[#bbb]" />
          </div>
          <h2 className="text-2xl font-black text-[#2d2d2d]">Create your first assignment</h2>
          <p className="mt-3 max-w-xl text-lg leading-8 text-[#777]">
            You have no assignments yet. Add one to start collecting and grading submissions.
          </p>
          <Link href="/create" className="mt-10 inline-flex h-14 items-center gap-3 rounded-full bg-[#111] px-8 text-base font-bold text-white shadow-xl shadow-black/20 hover:-translate-y-0.5 transition">
            <Plus size={22} />
            Create Your First Assignment
          </Link>
        </div>
      )}
    </div>
  );
}
