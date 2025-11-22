'use client';

import { format } from 'date-fns';
import Link from 'next/link';

interface HeaderProps {
  voterEmail: string | null;
  onLogout: () => void;
  blockCount: number;
}

export default function Header({ voterEmail, onLogout, blockCount }: HeaderProps) {
  return (
    <header className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Vote-B</h1>
          <p className="text-muted">Secure blockchain voting platform</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin" className="btn btn-ghost text-sm">
            Admin
          </Link>
          {voterEmail && (
            <button
              onClick={onLogout}
              className="btn btn-ghost text-sm"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {voterEmail && (
        <div className="card bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="text-sm text-muted mb-1">Registered Voter</div>
              <div className="text-sm font-semibold break-all">
                {voterEmail}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted mb-1">Blockchain Status</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium">
                  {blockCount} {blockCount === 1 ? 'block' : 'blocks'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-muted text-center">
        {format(new Date(), 'EEEE, MMMM d, yyyy')}
      </div>
    </header>
  );
}
