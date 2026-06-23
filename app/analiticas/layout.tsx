import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import Sidebar from '@/components/Sidebar';

export default async function AnaliticasLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 lg:ml-60 min-w-0">
        {children}
      </main>
    </div>
  );
}