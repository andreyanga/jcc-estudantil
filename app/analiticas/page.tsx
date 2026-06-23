'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { exportToExcel, exportBolsasToExcel } from '@/lib/excel';
import { Estudante, Bolsa } from '@/types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Download, Users, GraduationCap, BookOpen, Briefcase } from 'lucide-react';

const GREEN       = '#1a7a34';
const GREEN_LIGHT = '#2d9c4a';
const COLORS      = ['#1a7a34','#2d9c4a','#4ade80','#86efac','#bbf7d0','#6d28d9','#f59e0b','#ef4444'];

function Card({ title, value, sub, icon: Icon, cor }: {
  title: string; value: number; sub: string;
  icon: React.ElementType; cor: string;
}) {
  const bgs: Record<string, string> = {
    green:  'bg-green-50 border-green-100',
    blue:   'bg-blue-50 border-blue-100',
    purple: 'bg-purple-50 border-purple-100',
    amber:  'bg-amber-50 border-amber-100',
  };
  const txts: Record<string, string> = {
    green: '#1a7a34', blue: '#1d4ed8', purple: '#6d28d9', amber: '#92400e',
  };
  return (
    <div className={`rounded-2xl border p-5 ${bgs[cor]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: txts[cor] + '18' }}>
          <Icon size={20} style={{ color: txts[cor] }} />
        </div>
      </div>
      <div className="text-3xl font-bold mb-0.5" style={{ color: txts[cor], fontFamily: 'Sora, sans-serif' }}>
        {value}
      </div>
      <div className="text-sm font-semibold text-slate-700">{title}</div>
      <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-bold text-slate-800 text-base" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h2>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

export default function AnaliticasPage() {
  const supabase = createClient();
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [bolsas, setBolsas]         = useState<(Bolsa & { estudante?: Estudante })[]>([]);
  const [loading, setLoading]       = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    const [{ data: e }, { data: b }] = await Promise.all([
      supabase.from('estudantes').select('*').order('nome'),
      supabase.from('bolsas').select('*, estudante:estudantes(*)').order('created_at', { ascending: false }),
    ]);
    setEstudantes(e || []);
    setBolsas((b || []) as any);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // ── Calcular métricas ──
  const total      = estudantes.length;
  const superior   = estudantes.filter(e => e.nivel === 'Universidade').length;
  const medio      = estudantes.filter(e => e.nivel === 'Médio').length;
  const empregados = estudantes.filter(e => e.status === 'Empregado').length;
  const activos    = estudantes.filter(e => e.status === 'Activo').length;
  const totalBolsas = bolsas.length;
  const bolsasActivas = bolsas.filter(b => b.status === 'Activa').length;

  // Por província
  const porProv: Record<string, number> = {};
  estudantes.forEach(e => { porProv[e.provincia] = (porProv[e.provincia] || 0) + 1; });
  const dadosProv = Object.entries(porProv)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  // Por universidade (top 8)
  const porUni: Record<string, number> = {};
  estudantes.filter(e => e.universidade?.trim()).forEach(e => {
    porUni[e.universidade] = (porUni[e.universidade] || 0) + 1;
  });
  const dadosUni = Object.entries(porUni)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  // Por status
  const dadosStatus = [
    { name: 'Activo',    value: activos,    cor: '#1a7a34' },
    { name: 'Empregado', value: empregados, cor: '#f59e0b' },
    { name: 'Inactivo',  value: estudantes.filter(e => e.status === 'Inactivo').length, cor: '#94a3b8' },
  ].filter(d => d.value > 0);

  // Por nível
  const dadosNivel = [
    { name: 'Universidade', value: superior, cor: '#1a7a34' },
    { name: 'Ensino Médio', value: medio,    cor: '#6d28d9' },
  ].filter(d => d.value > 0);

  // Por ano/classe (universidade)
  const porAno: Record<string, number> = {};
  estudantes.filter(e => e.nivel === 'Universidade').forEach(e => {
    porAno[e.ano_classe] = (porAno[e.ano_classe] || 0) + 1;
  });
  const dadosAno = Object.entries(porAno)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, value]) => ({ name, value }));

  // Por curso (top 6)
  const porCurso: Record<string, number> = {};
  estudantes.filter(e => e.curso?.trim()).forEach(e => {
    porCurso[e.curso] = (porCurso[e.curso] || 0) + 1;
  });
  const dadosCurso = Object.entries(porCurso)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-slate-100 shadow-lg rounded-xl px-4 py-2.5 text-sm">
          <div className="font-semibold text-slate-800 mb-0.5">{label}</div>
          <div style={{ color: GREEN }} className="font-bold">{payload[0].value} estudante{payload[0].value !== 1 ? 's' : ''}</div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: GREEN, borderTopColor: 'transparent' }} />
          <div className="text-sm text-slate-400">A carregar análises...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in">

      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full" style={{ background: GREEN }} />
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
              Análises & Relatórios
            </h1>
          </div>
          <p className="text-slate-400 text-sm ml-4">Visão detalhada e exportação de dados da comissão</p>
        </div>

        {/* Botões de exportação */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => exportToExcel(estudantes, 'relatorio_estudantes')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={15} />
            Exportar Estudantes
          </button>
          <button
            onClick={() => exportBolsasToExcel(bolsas)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm"
            style={{ background: GREEN }}
          >
            <Download size={15} />
            Exportar Bolsas
          </button>
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card title="Total de Estudantes" value={total}      sub="Todos os registos"        icon={Users}         cor="green"  />
        <Card title="Universidade"        value={superior}   sub={`${Math.round(superior/total*100||0)}% do total`}  icon={GraduationCap} cor="blue"   />
        <Card title="Ensino Médio"        value={medio}      sub={`${Math.round(medio/total*100||0)}% do total`}    icon={BookOpen}      cor="purple" />
        <Card title="Empregados"          value={empregados} sub={`${Math.round(empregados/total*100||0)}% do total`} icon={Briefcase}   cor="amber"  />
      </div>

      {/* Linha 1: Status + Nível */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Distribuição por Status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <SectionTitle title="Por Status" sub="Distribuição dos estudantes por situação actual" />
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="60%" height={180}>
              <PieChart>
                <Pie data={dadosStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {dadosStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} estudantes`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {dadosStatus.map(d => (
                <div key={d.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.cor }} />
                      <span className="font-medium text-slate-700">{d.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{d.value}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.round(d.value/total*100)}%`, background: d.cor }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Distribuição por Nível */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <SectionTitle title="Por Nível de Ensino" sub="Universidade vs Ensino Médio" />
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="60%" height={180}>
              <PieChart>
                <Pie data={dadosNivel} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {dadosNivel.map((entry, i) => (
                    <Cell key={i} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} estudantes`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {dadosNivel.map(d => (
                <div key={d.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.cor }} />
                      <span className="font-medium text-slate-700">{d.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{d.value}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.round(d.value/total*100)}%`, background: d.cor }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Linha 2: Por Universidade */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
        <SectionTitle title="Por Universidade / Instituto" sub="Top 8 instituições com mais estudantes" />
        {dadosUni.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">Sem dados de universidade ainda</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dadosUni} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill={GREEN} radius={[6, 6, 0, 0]}>
                {dadosUni.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? GREEN : GREEN_LIGHT} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Linha 3: Por Ano + Por Curso */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Por Ano (Universidade) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <SectionTitle title="Por Ano (Universidade)" sub="Distribuição por ano curricular" />
          {dadosAno.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">Sem dados</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dadosAno} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill={GREEN} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Por Curso */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <SectionTitle title="Por Curso" sub="Top 6 cursos mais frequentes" />
          {dadosCurso.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">Sem dados de curso ainda</div>
          ) : (
            <div className="space-y-3 mt-2">
              {dadosCurso.map((d, i) => (
                <div key={d.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: COLORS[i % COLORS.length] }}>
                        {i + 1}
                      </div>
                      <span className="font-medium text-slate-700 truncate max-w-[160px]">{d.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{d.value}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${Math.round(d.value / dadosCurso[0].value * 100)}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Linha 4: Por Província */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
        <SectionTitle title="Por Província" sub="Distribuição geográfica dos estudantes" />
        {dadosProv.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">Sem dados</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dadosProv.map((d, i) => (
              <div key={d.name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{d.name}</div>
                  <div className="h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${Math.round(d.value / dadosProv[0].value * 100)}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
                <div className="text-sm font-bold flex-shrink-0" style={{ color: COLORS[i % COLORS.length] }}>{d.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumo de Bolsas */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle title="Resumo de Bolsas" sub="Estado actual das bolsas atribuídas" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total de Bolsas',  value: totalBolsas,  cor: GREEN,     bg: '#e8f5ec' },
            { label: 'Activas',          value: bolsasActivas, cor: GREEN,    bg: '#e8f5ec' },
            { label: 'Integrais',        value: bolsas.filter(b => b.tipo === 'Integral').length, cor: '#1d4ed8', bg: '#eff6ff' },
            { label: 'Parciais',         value: bolsas.filter(b => b.tipo === 'Parcial').length,  cor: '#92400e', bg: '#fffbeb' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 border"
              style={{ background: s.bg, borderColor: s.cor + '30' }}>
              <div className="text-2xl font-bold mb-0.5" style={{ color: s.cor, fontFamily: 'Sora, sans-serif' }}>{s.value}</div>
              <div className="text-xs font-medium text-slate-600">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}