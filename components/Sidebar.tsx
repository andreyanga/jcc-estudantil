'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { LayoutDashboard, Users, GraduationCap, BarChart2, LogOut, Menu, X } from 'lucide-react';

const NAV = [
  { href: '/dashboard',  label: 'Dashboard',             icon: LayoutDashboard },
  { href: '/estudantes', label: 'Estudantes',             icon: Users           },
  { href: '/bolsas',     label: 'Bolsas de Estudo',      icon: GraduationCap   },
  { href: '/analiticas', label: 'Análises & Relatórios', icon: BarChart2       },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-60 z-40
        bg-white border-r border-slate-100 shadow-sm
        flex flex-col transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>

        {/* Logo + botão fechar (mobile) */}
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

          {/* Botão fechar — só mobile, dentro da sidebar */}
          <button
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all flex-shrink-0"
            onClick={() => setOpen(false)}
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
                <item.icon size={17} className={active ? 'text-white' : 'text-slate-400'} />
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
      </aside>
    </>
  );
}