import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import EstudanteForm from '@/components/EstudanteForm';

export default async function NovoEstudantePage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return <EstudanteForm mode="create" />;
}