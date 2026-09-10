import { cn } from "@/lib/utils"

interface EvidenceBadgeProps {
  status: 'VERIFIED' | 'ESTIMATED' | 'DATA_UNAVAILABLE' | 'DATA_CONFLICT' | 'NEEDS_VERIFICATION' | 'VERIFIED_BASELINE' | 'SOURCE_CONFLICT';
  className?: string;
}

export function EvidenceBadge({ status, className }: EvidenceBadgeProps) {
  const safeStatus = status in {
    VERIFIED: 1, ESTIMATED: 1, DATA_UNAVAILABLE: 1, DATA_CONFLICT: 1, NEEDS_VERIFICATION: 1, VERIFIED_BASELINE: 1, SOURCE_CONFLICT: 1
  } ? status : 'ESTIMATED';

  const styles = {
    VERIFIED: "bg-green-100 text-green-800 border-green-200",
    VERIFIED_BASELINE: "bg-green-100 text-green-800 border-green-200",
    ESTIMATED: "bg-amber-100 text-amber-800 border-amber-200",
    DATA_UNAVAILABLE: "bg-gray-100 text-gray-800 border-gray-200",
    DATA_CONFLICT: "bg-red-100 text-red-800 border-red-200",
    SOURCE_CONFLICT: "bg-red-100 text-red-800 border-red-200",
    NEEDS_VERIFICATION: "bg-blue-100 text-blue-800 border-blue-200"
  };

  const labels = {
    VERIFIED: "Verified",
    VERIFIED_BASELINE: "Verified Baseline",
    ESTIMATED: "Estimated",
    DATA_UNAVAILABLE: "Data Unavailable",
    DATA_CONFLICT: "Data Conflict",
    SOURCE_CONFLICT: "Source Conflict",
    NEEDS_VERIFICATION: "Needs Verification"
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", styles[safeStatus], className)}>
      {labels[safeStatus]}
    </span>
  );
}
