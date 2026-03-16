import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-2 h-8 w-48" />
        </div>
        <Skeleton className="h-11 w-36 rounded-[var(--radius-button)]" />
      </div>

      {/* Card grid skeleton */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-[180px]" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-2/3" />
              <Skeleton className="mt-3 h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
