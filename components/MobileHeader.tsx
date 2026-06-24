'use client';
import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

const NAV = [
  { href: '/dashboard',  label: 'Dashboard',             emoji: '🏠' },
  { href: '/estudantes', label: 'Estudantes',             emoji: '👥' },
  { href: '/bolsas',     label: 'Bolsas de Estudo',      emoji: '🎓' },
  { href: '/analiticas', label: 'Análises & Relatórios', emoji: '📊' },
];

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="lg:hidden">

      {/* Barra superior mobile */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: '#1a7a34' }}
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: '#1a7a34', fontFamily: 'Sora, sans-serif' }}
          >
            J
          </div>
          <span className="font-bold text-slate-800 text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
            JCC Estudantil
          </span>
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer lateral */}
      {open && (
        <div className="fixed top-0 left-0 h-full w-60 z-40 bg-white border-r border-slate-100 shadow-xl flex flex-col">

          {/* Header do drawer */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: '#1a7a34', fontFamily: 'Sora, sans-serif' }}
              >
                JCC
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
                  JCC Estudantil
                </div>
                <div className="text-xs text-slate-400">Comissão Estudantil</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 pb-2">
              Menu
            </div>
            {NAV.map(item => {
              const active =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  style={active ? { background: '#1a7a34' } : {}}
                >
                  <span className="text-base">{item.emoji}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut size={15} /> Terminar sessão
            </button>
          </div>

        </div>
      )}
    </div>
  );
}