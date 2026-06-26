'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { EstudanteInsert, Estudante } from '@/types';
import { PROVINCIAS_ANGOLA, ANOS_UNIVERSIDADE, CLASSES_MEDIO, NIVEIS } from '@/lib/constants';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

interface Props {
  initialData?: Estudante;
  mode: 'create' | 'edit';
}

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

function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export default function EstudanteForm({ initialData, mode }: Props) {
  const router   = useRouter();
  const supabase = createClient();
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<EstudanteInsert>({
    nome:         initialData?.nome         || '',
    telefone:     initialData?.telefone     || '',
    nivel:        initialData?.nivel        || 'Universidade',
    ano_classe:   initialData?.ano_classe   || '',
    universidade: initialData?.universidade || '',
    curso:        initialData?.curso        || '',
    provincia:    initialData?.provincia    || 'Luanda',
    status:       initialData?.status       || 'Activo',
    observacoes:  initialData?.observacoes  || '',
    email:        initialData?.email        || '',
    sexo:         initialData?.sexo         || '',
    idade:        initialData?.idade        || null,
  });

  function set(field: keyof EstudanteInsert, value: any) {
    setForm(f => ({ ...f, [field]: value }));
    setError('');
  }

  function handleNivelChange(value: string) {
    setForm(f => ({ ...f, nivel: value as any, ano_classe: '' }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.nome.trim() || !form.telefone.trim() || !form.provincia) {
      setError('Preenche os campos obrigatórios: Nome, Telefone e Província.');
      return;
    }
    if ((form.nivel === 'Médio' || form.nivel === 'Universidade') && !form.ano_classe) {
      setError(`Selecciona ${form.nivel === 'Médio' ? 'a Classe' : 'o Ano'}.`);
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      nome:         form.nome.trim(),
      telefone:     form.telefone.trim(),
      nivel:        form.nivel,
      ano_classe:   form.ano_classe,
      universidade: form.nivel !== 'Médio' ? (form.universidade?.trim() || '') : '',
      curso:        form.nivel !== 'Médio' ? (form.curso?.trim()        || '') : '',
      provincia:    form.provincia,
      status:       form.status,
      observacoes:  form.observacoes?.trim() || '',
      email:        form.email?.trim()       || '',
      sexo:         form.sexo                || '',
      idade:        form.idade               || null,
    };

    if (mode === 'create') {
      const { error } = await supabase.from('estudantes').insert(payload);
      if (error) { setError('Erro ao cadastrar: ' + error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('estudantes').update(payload).eq('id', initialData!.id);
      if (error) { setError('Erro ao actualizar: ' + error.message); setSaving(false); return; }
    }

    setSuccess(true);
    setTimeout(() => router.push('/estudantes'), 1200);
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in">

      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 rounded-full" style={{ background: '#1a7a34' }} />
            <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
              {mode === 'create' ? 'Cadastrar Estudante' : 'Editar Estudante'}
            </h1>
          </div>
          <p className="text-slate-400 text-xs ml-3">
            {mode === 'create' ? 'Preenche os dados do novo membro' : `A editar: ${initialData?.nome}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">

        {/* Dados Pessoais */}
        <Section title="Dados Pessoais">
          <div className="sm:col-span-2">
            <Field label="Nome Completo" required>
              <input
                value={form.nome} onChange={e => set('nome', e.target.value)}
                placeholder="Nome completo do estudante"
                className={inputCls} onFocus={onFocus} onBlur={onBlur}
              />
            </Field>
          </div>

          <Field label="Nº de Telefone" required>
            <input
              value={form.telefone} onChange={e => set('telefone', e.target.value)}
              placeholder="9XX XXX XXX" type="tel"
              className={inputCls} onFocus={onFocus} onBlur={onBlur}
            />
          </Field>

          <Field label="Email">
            <input
              value={form.email || ''} onChange={e => set('email', e.target.value)}
              placeholder="exemplo@gmail.com" type="email"
              className={inputCls} onFocus={onFocus} onBlur={onBlur}
            />
          </Field>

          <Field label="Sexo">
            <select
              value={form.sexo || ''} onChange={e => set('sexo', e.target.value)}
              className={inputCls} onFocus={onFocus} onBlur={onBlur}>
              <option value="">Não especificado</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </Field>

          <Field label="Idade">
            <input
              value={form.idade ?? ''} type="number" min={14} max={60}
              onChange={e => set('idade', e.target.value ? Number(e.target.value) : null)}
              placeholder="ex: 22"
              className={inputCls} onFocus={onFocus} onBlur={onBlur}
            />
          </Field>

          <Field label="Província" required>
            <select
              value={form.provincia} onChange={e => set('provincia', e.target.value)}
              className={inputCls} onFocus={onFocus} onBlur={onBlur}>
              {PROVINCIAS_ANGOLA.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>

          <Field label="Status">
            <select
              value={form.status} onChange={e => set('status', e.target.value as any)}
              className={inputCls} onFocus={onFocus} onBlur={onBlur}>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Empregado">Empregado</option>
            </select>
          </Field>
        </Section>

        {/* Dados Académicos */}
        <Section title="Dados Académicos">

          {/* Toggle nível */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nível de Ensino <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {NIVEIS.map(opt => (
                <button
                  key={opt.value} type="button"
                  onClick={() => handleNivelChange(opt.value)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all"
                  style={form.nivel === opt.value
                    ? { background: '#1a7a34', color: 'white', borderColor: '#1a7a34' }
                    : { background: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Classe — só Ensino Médio */}
          {form.nivel === 'Médio' && (
            <Field label="Classe" required>
              <select
                value={form.ano_classe} onChange={e => set('ano_classe', e.target.value)}
                className={inputCls} onFocus={onFocus} onBlur={onBlur}>
                <option value="">Seleccionar classe...</option>
                {CLASSES_MEDIO.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
          )}

          {/* Ano — só Universidade */}
          {form.nivel === 'Universidade' && (
            <Field label="Ano" required>
              <select
                value={form.ano_classe} onChange={e => set('ano_classe', e.target.value)}
                className={inputCls} onFocus={onFocus} onBlur={onBlur}>
                <option value="">Seleccionar ano...</option>
                {ANOS_UNIVERSIDADE.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
          )}

          {/* Ano de conclusão — só Finalista */}
          {form.nivel === 'Finalista' && (
            <Field label="Ano de Conclusão">
              <input
                value={form.ano_classe} onChange={e => set('ano_classe', e.target.value)}
                placeholder="ex: 2024"
                className={inputCls} onFocus={onFocus} onBlur={onBlur}
              />
            </Field>
          )}

          {/* Universidade e Curso — Universidade e Finalista */}
          {(form.nivel === 'Universidade' || form.nivel === 'Finalista') && (
            <>
              <Field label="Universidade / Instituto">
                <input
                  value={form.universidade} onChange={e => set('universidade', e.target.value)}
                  placeholder="ex: UAN, UCAN, ISPTEC"
                  className={inputCls} onFocus={onFocus} onBlur={onBlur}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Curso">
                  <input
                    value={form.curso} onChange={e => set('curso', e.target.value)}
                    placeholder="ex: Enfermagem, Direito, Eng. Informática"
                    className={inputCls} onFocus={onFocus} onBlur={onBlur}
                  />
                </Field>
              </div>
            </>
          )}

        </Section>

        {/* Observações */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-5">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Observações</h2>
          <textarea
            value={form.observacoes} onChange={e => set('observacoes', e.target.value)}
            rows={3} placeholder="Notas adicionais..."
            className={`${inputCls} resize-none`} onFocus={onFocus} onBlur={onBlur}
          />
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            ✅ {mode === 'create' ? 'Estudante cadastrado' : 'Dados actualizados'} com sucesso!
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-60 transition-all shadow-sm hover:opacity-90"
            style={{ background: '#1a7a34' }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'A guardar...' : mode === 'create' ? 'Cadastrar Estudante' : 'Guardar Alterações'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
            Cancelar
          </button>
        </div>

      </form>
    </div>
  );
}