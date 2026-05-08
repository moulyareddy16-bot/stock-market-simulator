function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-slate-800/50 rounded-lg ${className}`}></div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-2xl h-48 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="w-24 h-6" />
          <Skeleton className="w-32 h-4" />
        </div>
        <Skeleton className="w-12 h-12 rounded-xl" />
      </div>
      <div className="flex justify-between items-end">
        <Skeleton className="w-20 h-8" />
        <div className="flex gap-2">
          <Skeleton className="w-16 h-8 rounded-lg" />
          <Skeleton className="w-16 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 glass border-slate-800/50 rounded-xl">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-1/4 h-5" />
            <Skeleton className="w-1/3 h-3" />
          </div>
          <Skeleton className="w-24 h-8" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
