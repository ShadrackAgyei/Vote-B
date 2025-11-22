'use client';

import { Wallet } from '@/lib/utils/wallet';
import { format } from 'date-fns';

interface HeaderProps {
  wallet: Wallet | null;
  onNewWallet: () => void;
  blockCount: number;
}

export default function Header({ wallet, onNewWallet, blockCount }: HeaderProps) {
  return (
    <header className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Vote-B</h1>
          <p className="text-muted">Secure blockchain voting platform</p>
        </div>
        {wallet && (
          <button
            onClick={onNewWallet}
            className="btn btn-ghost text-sm"
          >
            New Wallet
          </button>
        )}
      </div>

      {wallet && (
        <div className="card bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="text-sm text-muted mb-1">Wallet Address</div>
              <div className="font-mono text-sm font-semibold break-all">
                {wallet.getAddress()}
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
