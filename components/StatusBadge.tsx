export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Activo:    'bg-green-100 text-green-700 border-green-200',
    Inactivo:  'bg-slate-100 text-slate-500 border-slate-200',
    Empregado: 'bg-amber-100 text-amber-700 border-amber-200',
  };
  const dot: Record<string, string> = {
    Activo: 'bg-green-500', Inactivo: 'bg-slate-400', Empregado: 'bg-amber-500',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || map.Inactivo}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status] || dot.Inactivo}`} />
      {status}
    </span>
  );
}