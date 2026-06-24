import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import Sidebar from '@/components/Sidebar';
import MobileHeader from '@/components/MobileHeader';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 lg:ml-60 min-w-0 flex flex-col">
        <MobileHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}