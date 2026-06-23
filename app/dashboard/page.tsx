import { createServerSupabase } from '@/lib/supabase-server';
import { Estudante } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import NivelBadge from '@/components/NivelBadge';
import Link from 'next/link';

function initials(nome: string) {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function StatCard({ value, label, icon, cor }: { value: number; label: string; icon: string; cor: string }) {
  const cores: Record<string, { bg: string; text: string }> = {
    green:  { bg: 'bg-green-50 border-green-100',  text: '#1a7a34' },
    blue:   { bg: 'bg-blue-50 border-blue-100',    text: '#1d4ed8' },
    purple: { bg: 'bg-purple-50 border-purple-100', text: '#6d28d9' },
    amber:  { bg: 'bg-amber-50 border-amber-100',  text: '#92400e' },
  };
  const c = cores[cor];
  return (
    <div className={`rounded-2xl border p-5 ${c.bg}`}>
      <div className="text-2xl mb-3">{icon}</div>
      <div className="text-3xl font-bold mb-1" style={{ color: c.text, fontFamily: 'Sora, sans-serif' }}>
        {value}
      </div>
      <div className="text-sm text-slate-500 font-medium">{label}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('estudantes')
    .select('*')
    .order('created_at', { ascending: false });

  const lista: Estudante[] = data || [];
  const total      = lista.length;
  const superior   = lista.filter(e => e.nivel === 'Universidade').length;
  const medio      = lista.filter(e => e.nivel === 'Médio').length;
  const empregados = lista.filter(e => e.status === 'Empregado').length;

  // Distribuição por província
  const porProv: Record<string, number> = {};
  lista.forEach(e => { porProv[e.provincia] = (porProv[e.provincia] || 0) + 1; });
  const topProv = Object.entries(porProv).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const recentes = lista.slice(0, 6);

  return (
    <div className="p-6 lg:p-8 animate-fade-in">

      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-7 rounded-full" style={{ background: '#1a7a34' }} />
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
            Dashboard
          </h1>
        </div>
        <p className="text-slate-400 text-sm ml-4">Visão geral da Comissão Estudantil da JCC</p>
      </div>

      {/* Cards de estatística */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard value={total}      label="Total de Estudantes" icon="👥" cor="green"  />
        <StatCard value={superior}   label="Universidade"        icon="🎓" cor="blue"   />
        <StatCard value={medio}      label="Ensino Médio"        icon="📚" cor="purple" />
        <StatCard value={empregados} label="Empregados"          icon="💼" cor="amber"  />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Tabela de recentes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>
              Estudantes Recentes
            </h2>
            <Link href="/estudantes" className="text-xs font-semibold hover:underline" style={{ color: '#1a7a34' }}>
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentes.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Nenhum estudante cadastrado ainda.{' '}
                <Link href="/estudantes/novo" style={{ color: '#1a7a34' }} className="font-semibold hover:underline">
                  Cadastrar agora
                </Link>
              </div>
            ) : (
              recentes.map(e => (
                <div key={e.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: '#1a7a34' }}>
                    {initials(e.nome)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-sm truncate">{e.nome}</div>
                    <div className="text-xs text-slate-400">
                      {e.nivel === 'Universidade' ? (e.universidade || 'Sem universidade') : 'Ensino Médio'} · {e.provincia}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <NivelBadge nivel={e.nivel} ano_classe={e.ano_classe} />
                    <StatusBadge status={e.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna direita */}
        <div className="space-y-5">

          {/* Distribuição por província */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              Por Província
            </h2>
            <div className="space-y-3">
              {topProv.length === 0 ? (
                <div className="text-sm text-slate-400">Sem dados</div>
              ) : topProv.map(([prov, count]) => (
                <div key={prov}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{prov}</span>
                    <span className="text-slate-400">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.round(count / total * 100)}%`, background: '#1a7a34' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acções rápidas */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              Acções Rápidas
            </h2>
            <div className="space-y-2">
              <Link href="/estudantes/novo"
                className="flex items-center gap-3 p-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
                style={{ background: '#1a7a34' }}>
                ➕ Cadastrar Estudante
              </Link>
              <Link href="/estudantes"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold border border-slate-200 transition-all">
                📋 Ver Lista Completa
              </Link>
              <Link href="/bolsas"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold border border-slate-200 transition-all">
                🎓 Gestão de Bolsas
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}