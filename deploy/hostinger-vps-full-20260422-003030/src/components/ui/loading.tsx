import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export const Loading = ({ size = "md", className, text }: LoadingProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
}

export const LoadingOverlay = ({ isLoading, text }: LoadingOverlayProps) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card rounded-lg shadow-lg p-8 border">
        <Loading size="lg" text={text || "Carregando..."} />
      </div>
    </div>
  );
};

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export const LoadingSkeleton = ({ className, count = 1 }: LoadingSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "animate-pulse bg-muted rounded-lg",
            className || "h-64 w-full"
          )}
        />
      ))}
    </>
  );
};

export const LoadingCard = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-muted/30 rounded-lg aspect-square mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-muted/30 rounded w-3/4" />
        <div className="h-4 bg-muted/30 rounded w-1/2" />
        <div className="h-4 bg-muted/30 rounded w-2/3" />
      </div>
    </div>
  );
};
