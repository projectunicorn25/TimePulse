export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-zinc-800/50 rounded animate-pulse" />
      
      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-zinc-800/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
      
      <div className="card divide-y divide-zinc-800">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4">
            <div className="h-6 w-32 bg-zinc-800/50 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-zinc-800/50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}