
import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingDotsProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  className, 
  color,
  ...props 
}) => {
  return (
    <span className={cn("inline-flex space-x-1", className)} {...props}>
      <span
        className="animate-bounce h-2 w-2 rounded-full"
        style={{ backgroundColor: color || "currentColor" }}
      />
      <span
        className="animate-bounce delay-75 h-2 w-2 rounded-full"
        style={{ 
          backgroundColor: color || "currentColor",
          animationDelay: "0.1s" 
        }}
      />
      <span
        className="animate-bounce delay-150 h-2 w-2 rounded-full"
        style={{ 
          backgroundColor: color || "currentColor",
          animationDelay: "0.2s" 
        }}
      />
    </span>
  );
};
