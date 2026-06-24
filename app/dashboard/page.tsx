import { createServerSupabase } from '@/lib/supabase-server';
import { Estudante } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import NivelBadge from '@/components/NivelBadge';
import Link from 'next/link';

function initials(nome: string) {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function StatCard({ value, label, icon, cor, sub }: {
  value: number; label: string; icon: string; cor: string; sub?: string;
}) {
  const cores: Record<string, { bg: string; text: string }> = {
    green:  { bg: 'bg-green-50 border-green-100',   text: '#1a7a34' },
    blue:   { bg: 'bg-blue-50 border-blue-100',     text: '#1d4ed8' },
    purple: { bg: 'bg-purple-50 border-purple-100', text: '#6d28d9' },
    amber:  { bg: 'bg-amber-50 border-amber-100',   text: '#92400e' },
    rose:   { bg: 'bg-rose-50 border-rose-100',     text: '#be123c' },
  };
  const c = cores[cor];
  return (
    <div className={`rounded-2xl border p-4 ${c.bg}`}>
      <div className="text-xl mb-2">{icon}</div>
      <div className="text-2xl font-bold mb-0.5" style={{ color: c.text, fontFamily: 'Sora, sans-serif' }}>
        {value}
      </div>
      <div className="text-xs font-semibold text-slate-700 leading-tight">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
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
  const finalistas = lista.filter(e => e.nivel === 'Finalista').length;
  const empregados = lista.filter(e => e.status === 'Empregado').length;

  const porProv: Record<string, number> = {};
  lista.forEach(e => { porProv[e.provincia] = (porProv[e.provincia] || 0) + 1; });
  const topProv = Object.entries(porProv).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const nivelDist = [
    { label: 'Universidade', value: superior,   cor: '#1a7a34' },
    { label: 'Ensino Médio', value: medio,      cor: '#6d28d9' },
    { label: 'Finalistas',   value: finalistas, cor: '#92400e' },
    { label: 'Empregados',   value: empregados, cor: '#be123c' },
  ];

  const recentes = lista.slice(0, 6);

  return (
    <div className="p-4 lg:p-8 animate-fade-in">

      {/* Cabeçalho */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-7 rounded-full" style={{ background: '#1a7a34' }} />
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
            Dashboard
          </h1>
        </div>
        <p className="text-slate-400 text-sm ml-4">Visão geral da Comissão Estudantil da JCC</p>
      </div>

      {/* Cards — grelha 2x2 em mobile, 5 colunas em desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <StatCard value={total}      label="Total"        icon="👥" cor="green"  />
        <StatCard value={superior}   label="Universidade" icon="🎓" cor="blue"   />
        <StatCard value={medio}      label="Ensino Médio" icon="📚" cor="purple" />
        <StatCard value={finalistas} label="Finalistas"   icon="🏆" cor="amber"  />
        <StatCard value={empregados} label="Empregados"   icon="💼" cor="rose"   sub="" />
      </div>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Estudantes Recentes — ocupa 2 colunas em desktop */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
              Estudantes Recentes
            </h2>
            <Link href="/estudantes" className="text-xs font-semibold" style={{ color: '#1a7a34' }}>
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentes.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                Nenhum estudante cadastrado.{' '}
                <Link href="/estudantes/novo" style={{ color: '#1a7a34' }} className="font-semibold">
                  Cadastrar agora
                </Link>
              </div>
            ) : recentes.map(e => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{
                    background: e.nivel === 'Finalista' ? '#92400e'
                      : e.nivel === 'Médio' ? '#6d28d9'
                      : '#1a7a34'
                  }}
                >
                  {initials(e.nome)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 text-sm truncate">{e.nome}</div>
                  <div className="text-xs text-slate-400 truncate">
                    {e.nivel === 'Universidade'
                      ? e.universidade || 'Sem universidade'
                      : e.nivel === 'Finalista'
                      ? e.universidade || 'Finalista'
                      : 'Ensino Médio'
                    } · {e.provincia}
                  </div>
                </div>

                {/* Badges — empilhados em mobile */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <NivelBadge nivel={e.nivel} ano_classe="" />
                  <StatusBadge status={e.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna direita */}
        <div className="flex flex-col gap-4">

          {/* Por Nível */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h2 className="font-bold text-slate-800 text-sm mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
              Por Nível
            </h2>
            <div className="space-y-2.5">
              {nivelDist.filter(n => n.value > 0).map(n => (
                <div key={n.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: n.cor }} />
                      <span className="font-medium text-slate-700">{n.label}</span>
                    </div>
                    <span className="font-bold text-slate-800">{n.value}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.round(n.value / total * 100)}%`, background: n.cor }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Por Província */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h2 className="font-bold text-slate-800 text-sm mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
              Por Província
            </h2>
            <div className="space-y-2.5">
              {topProv.length === 0 ? (
                <div className="text-xs text-slate-400">Sem dados</div>
              ) : topProv.map(([prov, count]) => (
                <div key={prov}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 truncate">{prov}</span>
                    <span className="text-slate-400 ml-2 flex-shrink-0">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.round(count / total * 100)}%`, background: '#1a7a34' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acções Rápidas */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h2 className="font-bold text-slate-800 text-sm mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
              Acções Rápidas
            </h2>
            <div className="space-y-2">
              <Link
                href="/estudantes/novo"
                className="flex items-center gap-2 p-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
                style={{ background: '#1a7a34' }}
              >
                ➕ Cadastrar Estudante
              </Link>
              <Link
                href="/estudantes"
                className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold border border-slate-200 transition-all"
              >
                📋 Ver Lista Completa
              </Link>
              <Link
                href="/bolsas"
                className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold border border-slate-200 transition-all"
              >
                🎓 Gestão de Bolsas
              </Link>
              <Link
                href="/analiticas"
                className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold border border-slate-200 transition-all"
              >
                📊 Análises & Relatórios
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}