"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ClipboardList, Grid2X2, Library, Settings, Sparkles, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_BASE_URL } from '@/config';

const navItems = [
  { name: 'Home', icon: Grid2X2, href: '/' },
  { name: 'My Groups', icon: Users, href: '#', soon: 'My Groups is coming soon in V2!' },
  { name: 'Assignments', icon: ClipboardList, href: '/', badge: '10' },
  { name: "AI Teacher's Toolkit", icon: BookOpen, href: '#', soon: 'AI Toolkit is coming soon in V2!' },
  { name: 'My Library', icon: Library, href: '#', soon: 'My Library is coming soon in V2!' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/assignments`);
        setCount(response.data.length);
      } catch (err) {
        console.error('Error fetching assignments count:', err);
      }
    };
    fetchCount();
  }, [pathname]);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] p-2 lg:block">
      <div className="flex h-full flex-col rounded-2xl bg-white px-5 py-5 shadow-2xl shadow-black/15">
        <Link href="/" className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 via-orange-700 to-[#232323] text-xl font-black text-white shadow-lg shadow-orange-900/25">
            V
          </div>
          <span className="text-2xl font-black tracking-normal text-[#2b2b2b]">VedaAI</span>
        </Link>

        <Link
          href="/create"
          className="mb-12 inline-flex h-14 items-center justify-center gap-3 rounded-full border-[3px] border-[#f07a57] bg-[#242424] px-5 text-base font-bold text-white shadow-inner shadow-white/10 transition-all hover:-translate-y-0.5 hover:bg-black"
        >
          <Sparkles size={18} />
          Create Assignment
        </Link>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.name === 'Assignments' && (pathname === '/' || pathname.startsWith('/assignment') || pathname === '/create');
            const badgeValue = item.name === 'Assignments' && count !== null ? String(count) : item.badge;
            const content = (
              <span className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-all ${active ? 'bg-[#eeeeee] text-[#2d2d2d]' : 'text-[#7a7a7a] hover:bg-[#f3f3f3] hover:text-[#2d2d2d]'}`}>
                <Icon size={18} />
                <span className="flex-1">{item.name}</span>
                {badgeValue && active && (
                  <span className="rounded-full bg-[#ff5a1f] px-2 py-0.5 text-[11px] font-black text-white">{badgeValue}</span>
                )}
              </span>
            );

            if (item.soon) {
              return (
                <button key={item.name} onClick={() => toast(item.soon)} className="block w-full text-left">
                  {content}
                </button>
              );
            }

            return (
              <Link key={item.name} href={item.href}>
                {content}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <button
            onClick={() => toast('Settings is coming soon in V2!')}
            className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#7a7a7a] transition-all hover:bg-[#f3f3f3] hover:text-[#2d2d2d]"
          >
            <Settings size={18} />
            Settings
          </button>

          <div className="flex items-center gap-3 rounded-2xl bg-[#eeeeee] p-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-black text-[#2d2d2d] shadow-sm">
              DP
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[#2d2d2d]">Delhi Public School</p>
              <p className="truncate text-xs font-medium text-[#777]">Bokaro Steel City</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
