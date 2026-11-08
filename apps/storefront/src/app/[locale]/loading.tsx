import { Skeleton } from "../../components/skeletons";

export default function GlobalLoading() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 pb-24 space-y-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <Skeleton className="h-48 sm:h-72 w-full rounded-sm" />

      {/* Row Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-4">
        <Skeleton className="aspect-[3/4] w-full" />
        <Skeleton className="aspect-[3/4] w-full" />
        <Skeleton className="aspect-[3/4] w-full hidden md:block" />
        <Skeleton className="aspect-[3/4] w-full hidden md:block" />
      </div>
    </div>
  );
}

