"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronDown, ChevronLeft, Grid2X2 } from 'lucide-react';

function getTitle(pathname: string) {
  if (pathname === '/create') return 'Assignment';
  if (pathname.startsWith('/assignment')) return 'Create New';
  return 'Assignment';
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const title = getTitle(pathname);

  return (
    <header className="sticky top-0 z-20 pt-3">
      <div className="flex h-16 items-center justify-between rounded-2xl bg-white/95 px-4 shadow-sm backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7f7f7] text-[#2d2d2d] transition-all hover:bg-[#eeeeee]"
            aria-label="Go back"
          >
            <ChevronLeft size={26} />
          </button>
          <Grid2X2 size={22} className="hidden text-[#aaa] sm:block" />
          <span className="truncate text-base font-bold text-[#a5a5a5] sm:text-lg">{title}</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#f7f7f7] text-[#2d2d2d]" aria-label="Notifications">
            <Bell size={23} />
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-[#ff5722]" />
          </button>

          <button className="flex h-12 items-center gap-3 rounded-full bg-[#f7f7f7] pl-2 pr-4 text-[#2d2d2d]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffe2d8] text-xs font-black">JD</span>
            <span className="hidden text-sm font-black sm:block">John Doe</span>
            <ChevronDown size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
