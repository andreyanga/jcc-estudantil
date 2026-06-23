import { redirect, notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import EstudanteForm from '@/components/EstudanteForm';

export default async function EditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase.from('estudantes').select('*').eq('id', id).single();
  if (!data) notFound();

  return <EstudanteForm mode="edit" initialData={data} />;
}