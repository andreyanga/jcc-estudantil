'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { exportToExcel } from '@/lib/excel';
import { Estudante } from '@/types';
import { PROVINCIAS_ANGOLA } from '@/lib/constants';
import StatusBadge from '@/components/StatusBadge';
import NivelBadge from '@/components/NivelBadge';
import { Search, Download, Plus, Eye, Pencil, Trash2, Filter, X } from 'lucide-react';

const PER_PAGE = 15;

function initials(nome: string) {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

export default function EstudantesPage() {
  const router = useRouter();
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [filtered, setFiltered]     = useState<Estudante[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroProv, setFiltroProv]     = useState('');
  const [filtroNivel, setFiltroNivel]   = useState('');
  const [page, setPage]             = useState(1);
  const [showFiltros, setShowFiltros]   = useState(false);
  const [verEstudante, setVerEstudante] = useState<Estudante | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [deleteNome, setDeleteNome] = useState('');
  const [deleting, setDeleting]     = useState(false);

  const supabase = createClient();

  const carregar = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('estudantes').select('*').order('nome');
    setEstudantes(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    let lista = [...estudantes];
    if (search) {
      const q = search.toLowerCase();
      lista = lista.filter(e =>
        e.nome.toLowerCase().includes(q) ||
        e.telefone.includes(q) ||
        (e.universidade || '').toLowerCase().includes(q) ||
        (e.curso || '').toLowerCase().includes(q)
      );
    }
    if (filtroStatus) lista = lista.filter(e => e.status === filtroStatus);
    if (filtroProv)   lista = lista.filter(e => e.provincia === filtroProv);
    if (filtroNivel)  lista = lista.filter(e => e.nivel === filtroNivel);
    setFiltered(lista);
    setPage(1);
  }, [estudantes, search, filtroStatus, filtroProv, filtroNivel]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const temFiltros = search || filtroStatus || filtroProv || filtroNivel;

  function limparFiltros() {
    setSearch(''); setFiltroStatus(''); setFiltroProv(''); setFiltroNivel('');
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await supabase.from('estudantes').delete().eq('id', deleteId);
    setDeleteId(null);
    setDeleting(false);
    carregar();
  }

  const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#1a7a34';
    e.target.style.background  = 'white';
  };
  const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.background  = '#f8fafc';
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full" style={{ background: '#1a7a34' }} />
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
              Estudantes
            </h1>
          </div>
          <p className="text-slate-400 text-sm ml-4">Lista completa de estudantes cadastrados</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToExcel(filtered)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>
          <Link
            href="/estudantes/novo"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
            style={{ background: '#1a7a34' }}
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Novo Estudante</span>
          </Link>
        </div>
      </div>

      {/* Barra de pesquisa e filtros */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-5">
        <div className="p-4 flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, telefone, universidade..."
              className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none transition-all"
              onFocus={inputFocus} onBlur={inputBlur}
            />
          </div>
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
              showFiltros
                ? 'border-green-600 text-green-700 bg-green-50'
                : 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <Filter size={14} />
            Filtros
            {temFiltros && <span className="w-2 h-2 rounded-full bg-green-600" />}
          </button>
          {temFiltros && (
            <button
              onClick={limparFiltros}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-all"
            >
              <X size={13} /> Limpar
            </button>
          )}
        </div>

        {showFiltros && (
          <div className="px-4 pb-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
              className="px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-700 focus:outline-none transition-all"
              onFocus={inputFocus} onBlur={inputBlur}
            >
              <option value="">Todos os status</option>
              <option>Activo</option>
              <option>Inactivo</option>
              <option>Empregado</option>
            </select>
            <select
              value={filtroNivel} onChange={e => setFiltroNivel(e.target.value)}
              className="px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-700 focus:outline-none transition-all"
              onFocus={inputFocus} onBlur={inputBlur}
            >
              <option value="">Todos os níveis</option>
              <option value="Médio">Ensino Médio</option>
              <option value="Universidade">Universidade</option>
            </select>
            <select
              value={filtroProv} onChange={e => setFiltroProv(e.target.value)}
              className="px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-700 focus:outline-none transition-all"
              onFocus={inputFocus} onBlur={inputBlur}
            >
              <option value="">Todas as províncias</option>
              {PROVINCIAS_ANGOLA.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">
            {filtered.length} estudante{filtered.length !== 1 ? 's' : ''}
          </span>
          {totalPages > 1 && (
            <span className="text-xs text-slate-400">Página {page} de {totalPages}</span>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
              style={{ borderColor: '#1a7a34', borderTopColor: 'transparent' }} />
            <div className="text-sm text-slate-400">A carregar...</div>
          </div>
        ) : pageData.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-slate-500 font-medium">Nenhum estudante encontrado</div>
            <div className="text-slate-400 text-sm mt-1">Tenta ajustar os filtros</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">#</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Telefone</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Nível</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider hidden xl:table-cell">Universidade</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider hidden xl:table-cell">Província</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pageData.map((e, i) => (
                  <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-400">{(page - 1) * PER_PAGE + i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: '#1a7a34' }}>
                          {initials(e.nome)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 text-sm truncate max-w-[150px]">{e.nome}</div>
                          <div className="text-xs text-slate-400 md:hidden">{e.telefone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">{e.telefone}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <NivelBadge nivel={e.nivel} ano_classe={e.ano_classe} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden xl:table-cell">
                      {e.universidade || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden xl:table-cell">{e.provincia}</td>
                    <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setVerEstudante(e)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-green-50 hover:text-green-700 transition-all" title="Ver">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => router.push(`/estudantes/${e.id}/editar`)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all" title="Editar">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => { setDeleteId(e.id); setDeleteNome(e.nome); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all" title="Remover">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} de {filtered.length}
            </span>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="w-8 h-8 rounded-lg border border-slate-200 text-xs flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition-all">
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-lg border text-xs flex items-center justify-center transition-all"
                  style={page === p
                    ? { background: '#1a7a34', color: 'white', borderColor: '#1a7a34' }
                    : { borderColor: '#e2e8f0' }}>
                  {p}
                </button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="w-8 h-8 rounded-lg border border-slate-200 text-xs flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition-all">
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal — Ver estudante */}
      {verEstudante && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setVerEstudante(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-fade-in"
            onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ background: '#1a7a34' }}>
                    {initials(verEstudante.nome)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
                      {verEstudante.nome}
                    </h3>
                    <div className="text-xs text-slate-400">
                      {verEstudante.nivel === 'Universidade'
                        ? verEstudante.universidade || 'Sem universidade'
                        : 'Ensino Médio'}
                    </div>
                  </div>
                </div>
                <button onClick={() => setVerEstudante(null)} className="text-slate-400 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { l: 'Telefone',   v: verEstudante.telefone },
                  { l: 'Província',  v: verEstudante.provincia },
                  { l: 'Nível',      v: verEstudante.nivel },
                  { l: 'Ano/Classe', v: verEstudante.ano_classe || '—' },
                  { l: 'Universidade', v: verEstudante.universidade || '—' },
                  { l: 'Curso',      v: verEstudante.curso || '—' },
                ].map(({ l, v }) => (
                  <div key={l} className="bg-slate-50 rounded-xl p-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{l}</div>
                    <div className="text-sm font-medium text-slate-800">{v}</div>
                  </div>
                ))}
                {verEstudante.observacoes && (
                  <div className="col-span-2 bg-slate-50 rounded-xl p-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Observações</div>
                    <div className="text-sm text-slate-700">{verEstudante.observacoes}</div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => { router.push(`/estudantes/${verEstudante.id}/editar`); setVerEstudante(null); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
                  style={{ background: '#1a7a34' }}>
                  Editar
                </button>
                <button onClick={() => setVerEstudante(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">
                  Fechar
                </button>
              </div>
            </div>
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
                Confirmar Remoção
              </h3>
              <p className="text-sm text-slate-500">
                Tens a certeza que queres remover{' '}
                <strong className="text-slate-800">{deleteNome}</strong>?
                Esta acção não pode ser desfeita.
              </p>
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