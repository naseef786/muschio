import { Skeleton, ProductGridSkeleton } from "../../../components/skeletons";

export default function ShopLoading() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10 pb-20 animate-pulse">
      {/* 1. Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-3 w-12" />
        <span className="text-neutral-300 dark:text-neutral-700">/</span>
        <Skeleton className="h-3 w-20" />
      </div>

      {/* 2. Header Skeleton */}
      <div className="pb-6 border-b border-neutral-100 dark:border-neutral-800 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      {/* 3. Toolbar Skeleton */}
      <div className="py-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 gap-4">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28 hidden sm:block" />
          <Skeleton className="h-9 w-28 hidden md:block" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      {/* 4. Product Grid Skeleton */}
      <div className="pt-6">
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}

