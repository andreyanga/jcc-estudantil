import * as XLSX from 'xlsx';
import { Estudante, Bolsa } from '@/types';

export function exportToExcel(estudantes: Estudante[], filename = 'estudantes_jcc') {
  const data = estudantes.map((e, i) => ({
    'Nº':            i + 1,
    'Nome Completo': e.nome,
    'Telefone':      e.telefone,
    'Nível':         e.nivel,
    'Ano/Classe':    e.ano_classe,
    'Universidade':  e.universidade || '—',
    'Curso':         e.curso        || '—',
    'Província':     e.provincia,
    'Status':        e.status,
    'Observações':   e.observacoes  || '',
    'Cadastrado em': new Date(e.created_at).toLocaleDateString('pt-AO'),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    {wch:5},{wch:32},{wch:15},{wch:14},
    {wch:12},{wch:22},{wch:24},{wch:16},{wch:12},{wch:30},{wch:16},
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Estudantes');

  // Resumo
  const resumo = [
    ['JCC — Comissão Estudantil'],
    ['Gerado em:', new Date().toLocaleDateString('pt-AO')],
    [''],
    ['Total de estudantes:', estudantes.length],
    ['Universidade:', estudantes.filter(e => e.nivel === 'Universidade').length],
    ['Ensino Médio:', estudantes.filter(e => e.nivel === 'Médio').length],
    ['Empregados:', estudantes.filter(e => e.status === 'Empregado').length],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(resumo);
  ws2['!cols'] = [{wch:28},{wch:20}];
  XLSX.utils.book_append_sheet(wb, ws2, 'Resumo');

  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

export function exportBolsasToExcel(bolsas: (Bolsa & { estudante?: Estudante })[]) {
  const data = bolsas.map((b, i) => ({
    'Nº':            i + 1,
    'Estudante':     b.estudante?.nome || '—',
    'Tipo':          b.tipo,
    'Instituição':   b.instituicao,
    'Curso':         b.curso        || '—',
    'Valor (AOA)':   b.valor        || '—',
    'Data Início':   new Date(b.data_inicio).toLocaleDateString('pt-AO'),
    'Data Fim':      b.data_fim ? new Date(b.data_fim).toLocaleDateString('pt-AO') : '—',
    'Status':        b.status,
    'Observações':   b.observacoes  || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    {wch:5},{wch:32},{wch:12},{wch:22},
    {wch:22},{wch:14},{wch:14},{wch:14},{wch:12},{wch:30},
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bolsas');
  XLSX.writeFile(wb, `bolsas_jcc_${new Date().toISOString().slice(0,10)}.xlsx`);
}