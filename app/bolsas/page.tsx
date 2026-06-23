'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { Bolsa, Estudante, BolsaInsert } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import { GraduationCap, Plus, X, Search, Loader2, Save, Trash2 } from 'lucide-react';

const inputCls = `w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm
  bg-slate-50 text-slate-800 focus:outline-none transition-all`;

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#1a7a34';
  e.target.style.background  = 'white';
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#e2e8f0';
  e.target.style.background  = '#f8fafc';
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function BolsaStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Activa:    'bg-green-100 text-green-700 border-green-200',
    Suspensa:  'bg-amber-100 text-amber-700 border-amber-200',
    Concluída: 'bg-slate-100 text-slate-500 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || map.Activa}`}>
      {status}
    </span>
  );
}

function initials(nome: string) {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

const FORM_VAZIO: BolsaInsert = {
  estudante_id: '',
  tipo:         'Parcial',
  instituicao:  '',
  curso:        '',
  valor:        null,
  data_inicio:  new Date().toISOString().slice(0, 10),
  data_fim:     null,
  status:       'Activa',
  observacoes:  '',
};

export default function BolsasPage() {
  const supabase = createClient();

  const [bolsas, setBolsas]           = useState<(Bolsa & { estudante: Estudante })[]>([]);
  const [estudantes, setEstudantes]   = useState<Estudante[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');
  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [deleting, setDeleting]       = useState(false);
  const [form, setForm]               = useState<BolsaInsert>(FORM_VAZIO);

  const carregar = useCallback(async () => {
    setLoading(true);
    const [{ data: b }, { data: e }] = await Promise.all([
      supabase.from('bolsas').select('*, estudante:estudantes(*)').order('created_at', { ascending: false }),
      supabase.from('estudantes').select('*').order('nome'),
    ]);
    setBolsas((b || []) as any);
    setEstudantes(e || []);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function setF(field: keyof BolsaInsert, value: any) {
    setForm(f => ({ ...f, [field]: value }));
    setError('');
  }

  function abrirModal() {
    setForm(FORM_VAZIO);
    setError('');
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.estudante_id || !form.instituicao.trim() || !form.data_inicio) {
      setError('Preenche os campos obrigatórios: Estudante, Instituição e Data de início.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('bolsas').insert({
      ...form,
      instituicao: form.instituicao.trim(),
      curso:       form.curso?.trim() || '',
      observacoes: form.observacoes?.trim() || '',
      valor:       form.valor || null,
      data_fim:    form.data_fim || null,
    });
    if (error) { setError('Erro: ' + error.message); setSaving(false); return; }
    setSaving(false);
    setShowModal(false);
    carregar();
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await supabase.from('bolsas').delete().eq('id', deleteId);
    setDeleteId(null);
    setDeleting(false);
    carregar();
  }

  const filtered = bolsas.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      b.estudante?.nome.toLowerCase().includes(q) ||
      b.instituicao.toLowerCase().includes(q) ||
      (b.curso || '').toLowerCase().includes(q);
    const matchStatus = !filtroStatus || b.status === filtroStatus;
    return matchSearch && matchStatus;
  });

  const totalActivas   = bolsas.filter(b => b.status === 'Activa').length;
  const totalIntegrais = bolsas.filter(b => b.tipo === 'Integral').length;
  const totalParciais  = bolsas.filter(b => b.tipo === 'Parcial').length;

  // Preenche automaticamente instituição e curso ao seleccionar estudante
  function handleEstudanteChange(id: string) {
    const est = estudantes.find(e => e.id === id);
    setForm(f => ({
      ...f,
      estudante_id: id,
      instituicao: est?.universidade || f.instituicao,
      curso:       est?.curso        || f.curso,
    }));
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full" style={{ background: '#1a7a34' }} />
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
              Bolsas de Estudo
            </h1>
          </div>
          <p className="text-slate-400 text-sm ml-4">Gestão e atribuição de bolsas de estudo</p>
        </div>
        <button onClick={abrirModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
          style={{ background: '#1a7a34' }}>
          <Plus size={15} /> Atribuir Bolsa
        </button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total de Bolsas',  value: bolsas.length,   icon: '🎓', cor: '#1a7a34', bg: 'bg-green-50 border-green-100' },
          { label: 'Activas',          value: totalActivas,    icon: '✅', cor: '#1a7a34', bg: 'bg-green-50 border-green-100' },
          { label: 'Integrais',        value: totalIntegrais,  icon: '💯', cor: '#1d4ed8', bg: 'bg-blue-50 border-blue-100'   },
          { label: 'Parciais',         value: totalParciais,   icon: '📊', cor: '#92400e', bg: 'bg-amber-50 border-amber-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
            <div className="text-xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold mb-0.5" style={{ color: s.cor, fontFamily: 'Sora, sans-serif' }}>{s.value}</div>
            <div className="text-xs text-slate-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pesquisa e filtro */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por estudante ou instituição..."
            className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none transition-all"
            onFocus={onFocus} onBlur={onBlur} />
        </div>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
          className="px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-700 focus:outline-none"
          onFocus={onFocus} onBlur={onBlur}>
          <option value="">Todos os status</option>
          <option>Activa</option>
          <option>Suspensa</option>
          <option>Concluída</option>
        </select>
      </div>

      {/* Lista de bolsas */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: '#1a7a34', borderTopColor: 'transparent' }} />
          <div className="text-sm text-slate-400">A carregar bolsas...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <GraduationCap size={40} className="mx-auto mb-3 text-slate-300" />
          <div className="text-slate-500 font-medium mb-1">Nenhuma bolsa encontrada</div>
          <div className="text-slate-400 text-sm mb-4">Atribui a primeira bolsa de estudo a um estudante</div>
          <button onClick={abrirModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
            style={{ background: '#1a7a34' }}>
            <Plus size={14} /> Atribuir Bolsa
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: '#1a7a34' }}>
                {initials(b.estudante?.nome || '?')}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{b.estudante?.nome || '—'}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{b.instituicao} {b.curso ? `· ${b.curso}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <BolsaStatusBadge status={b.status} />
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      b.tipo === 'Integral'
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-amber-100 text-amber-700 border-amber-200'
                    }`}>
                      {b.tipo}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="text-xs text-slate-500">
                    📅 Início: <span className="font-medium text-slate-700">
                      {new Date(b.data_inicio).toLocaleDateString('pt-AO')}
                    </span>
                  </div>
                  {b.data_fim && (
                    <div className="text-xs text-slate-500">
                      🏁 Fim: <span className="font-medium text-slate-700">
                        {new Date(b.data_fim).toLocaleDateString('pt-AO')}
                      </span>
                    </div>
                  )}
                  {b.valor && (
                    <div className="text-xs text-slate-500">
                      💰 Valor: <span className="font-medium text-slate-700">
                        {b.valor.toLocaleString('pt-AO')} AOA/mês
                      </span>
                    </div>
                  )}
                </div>

                {b.observacoes && (
                  <div className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                    {b.observacoes}
                  </div>
                )}
              </div>

              {/* Remover */}
              <button onClick={() => setDeleteId(b.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all flex-shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal — Atribuir bolsa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Atribuir Bolsa de Estudo
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">

              <Field label="Estudante" required>
                <select value={form.estudante_id} onChange={e => handleEstudanteChange(e.target.value)}
                  className={inputCls} onFocus={onFocus} onBlur={onBlur}>
                  <option value="">Seleccionar estudante...</option>
                  {estudantes.map(e => (
                    <option key={e.id} value={e.id}>{e.nome}</option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Tipo de Bolsa" required>
                  <select value={form.tipo} onChange={e => setF('tipo', e.target.value)}
                    className={inputCls} onFocus={onFocus} onBlur={onBlur}>
                    <option value="Parcial">Parcial</option>
                    <option value="Integral">Integral</option>
                  </select>
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={e => setF('status', e.target.value)}
                    className={inputCls} onFocus={onFocus} onBlur={onBlur}>
                    <option value="Activa">Activa</option>
                    <option value="Suspensa">Suspensa</option>
                    <option value="Concluída">Concluída</option>
                  </select>
                </Field>
              </div>

              <Field label="Instituição" required>
                <input value={form.instituicao} onChange={e => setF('instituicao', e.target.value)}
                  placeholder="ex: UAN, UCAN, ISPTEC"
                  className={inputCls} onFocus={onFocus} onBlur={onBlur} />
              </Field>

              <Field label="Curso">
                <input value={form.curso || ''} onChange={e => setF('curso', e.target.value)}
                  placeholder="ex: Enfermagem, Direito"
                  className={inputCls} onFocus={onFocus} onBlur={onBlur} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Data de Início" required>
                  <input type="date" value={form.data_inicio} onChange={e => setF('data_inicio', e.target.value)}
                    className={inputCls} onFocus={onFocus} onBlur={onBlur} />
                </Field>
                <Field label="Data de Fim">
                  <input type="date" value={form.data_fim || ''} onChange={e => setF('data_fim', e.target.value || null)}
                    className={inputCls} onFocus={onFocus} onBlur={onBlur} />
                </Field>
              </div>

              <Field label="Valor Mensal (AOA)">
                <input type="number" value={form.valor ?? ''} onChange={e => setF('valor', e.target.value ? Number(e.target.value) : null)}
                  placeholder="ex: 50000"
                  className={inputCls} onFocus={onFocus} onBlur={onBlur} />
              </Field>

              <Field label="Observações">
                <textarea value={form.observacoes} onChange={e => setF('observacoes', e.target.value)}
                  rows={2} placeholder="Notas sobre a bolsa..."
                  className={`${inputCls} resize-none`} onFocus={onFocus} onBlur={onBlur} />
              </Field>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-60 transition-all hover:opacity-90"
                  style={{ background: '#1a7a34' }}>
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? 'A guardar...' : 'Atribuir Bolsa'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal — Confirmar delete */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl animate-fade-in p-6">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={22} className="text-red-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                Remover Bolsa
              </h3>
              <p className="text-sm text-slate-500">Tens a certeza que queres remover esta bolsa? Esta acção não pode ser desfeita.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-all">
                {deleting ? 'A remover...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}