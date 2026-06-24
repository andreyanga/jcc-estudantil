export default function NivelBadge({ nivel, ano_classe }: { nivel: string; ano_classe: string }) {
  if (nivel === 'Médio') {
    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
          📚 Médio
        </span>
        {ano_classe && <span className="text-xs text-slate-400">{ano_classe}</span>}
      </div>
    );
  }

  if (nivel === 'Finalista') {
    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
          🏆 Finalista
        </span>
        {ano_classe && <span className="text-xs text-slate-400">{ano_classe}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
        🎓 Universidade
      </span>
      {ano_classe && <span className="text-xs text-slate-400">{ano_classe}</span>}
    </div>
  );
}