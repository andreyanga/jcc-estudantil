'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Email ou senha incorrectos. Tente novamente.');
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #e8f5ec 0%, #f8fafc 60%)' }}>

      {/* Painel esquerdo — só desktop */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-16"
        style={{ background: 'linear-gradient(160deg, #1a7a34 0%, #145c27 100%)' }}>
        <div className="text-center text-white max-w-sm">
          <div className="bg-white rounded-2xl p-6 inline-block mb-8 shadow-2xl">
            <div className="text-5xl font-bold" style={{ color: '#1a7a34', fontFamily: 'Sora, sans-serif' }}>JCC</div>
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
            Comissão Estudantil
          </h1>
          <p className="text-green-200 text-base leading-relaxed">
            Plataforma de gestão e acompanhamento dos estudantes da Juventude Cristã Combatente de Luanda.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3 text-sm">
            {[
              { icon: '🎓', label: 'Acompanhamento Académico' },
              { icon: '💼', label: 'Oportunidades de Emprego' },
              { icon: '🏫', label: 'Bolsas de Estudo' },
              { icon: '📊', label: 'Relatórios em Excel' },
            ].map(item => (
              <div key={item.label} className="bg-white/10 rounded-xl p-3 text-left">
                <div className="text-lg mb-1">{item.icon}</div>
                <div className="text-green-100 text-xs font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ background: '#1a7a34', fontFamily: 'Sora, sans-serif' }}>JCC</div>
              <div className="text-left">
                <div className="font-bold" style={{ color: '#1a7a34', fontFamily: 'Sora, sans-serif' }}>JCC Estudantil</div>
                <div className="text-xs text-slate-400">Comissão Estudantil</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
              Bem-vindo de volta
            </h2>
            <p className="text-slate-400 text-sm mb-7">Aceda ao sistema de gestão estudantil</p>

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <input
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none transition-all"
                  onFocus={e => { e.target.style.borderColor = '#1a7a34'; e.target.style.background = 'white'; }}
                  onBlur={e  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Senha</label>
                <input
                  type="password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none transition-all"
                  onFocus={e => { e.target.style.borderColor = '#1a7a34'; e.target.style.background = 'white'; }}
                  onBlur={e  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all mt-2 disabled:opacity-60"
                style={{ background: '#1a7a34' }}
                onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.background = '#145c27'; }}
                onMouseLeave={e => { if (!loading) (e.target as HTMLElement).style.background = '#1a7a34'; }}
              >
                {loading ? 'A entrar...' : 'Entrar no sistema'}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-6 pt-5 border-t border-slate-100">
              Para criar conta, contacta o administrador.
            </p>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            JCC · Juventude Cristã Combatente · Luanda, Angola
          </p>
        </div>
      </div>
    </div>
  );
}