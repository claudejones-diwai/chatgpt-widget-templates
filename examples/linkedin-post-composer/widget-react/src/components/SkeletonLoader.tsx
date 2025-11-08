import { Skeleton } from "./Skeleton";

export function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-4">
        {/* Header skeleton */}
        <div className="bg-surface rounded-xl p-4 space-y-3">
          <Skeleton variant="rectangular" height="48px" width="100%" />
          <div className="flex items-center gap-3">
            <Skeleton variant="rectangular" height="40px" width="120px" />
            <Skeleton variant="rectangular" height="40px" width="120px" />
            <Skeleton variant="rectangular" height="40px" width="120px" />
            <div className="flex-1"></div>
            <Skeleton variant="rectangular" height="40px" width="120px" />
          </div>
        </div>

        {/* Separator */}
        <div className="relative border-t border-border">
          <div className="absolute left-1/2 -translate-x-1/2 -top-4">
            <Skeleton variant="circular" width="32px" height="32px" />
          </div>
        </div>

        {/* Post preview skeleton */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {/* Post header */}
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Skeleton variant="circular" width="48px" height="48px" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="40%" height="20px" />
                <Skeleton variant="text" width="60%" height="16px" />
                <Skeleton variant="text" width="30%" height="14px" />
              </div>
            </div>

            {/* Post content */}
            <div className="space-y-2">
              <Skeleton variant="text" width="100%" height="16px" />
              <Skeleton variant="text" width="95%" height="16px" />
              <Skeleton variant="text" width="88%" height="16px" />
              <Skeleton variant="text" width="92%" height="16px" />
            </div>
          </div>

          {/* Image placeholder */}
          <Skeleton variant="rectangular" height="300px" width="100%" animation="wave" />

          {/* Engagement buttons */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <Skeleton variant="rectangular" height="32px" width="80px" />
              <Skeleton variant="rectangular" height="32px" width="100px" />
              <Skeleton variant="rectangular" height="32px" width="80px" />
              <Skeleton variant="rectangular" height="32px" width="80px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
