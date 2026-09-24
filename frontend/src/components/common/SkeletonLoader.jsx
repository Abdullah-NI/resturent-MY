import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900/60 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-pulse flex flex-col h-80 shadow-sm">
      <div className="h-48 bg-zinc-200 dark:bg-zinc-800" />
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
          <div className="h-3 bg-zinc-200/60 dark:bg-zinc-800/60 rounded w-full" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-16" />
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-full w-20" />
        </div>
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-10 w-28 bg-zinc-200 dark:bg-zinc-800/80 rounded-full animate-pulse shrink-0" />
      ))}
    </div>
  );
}
