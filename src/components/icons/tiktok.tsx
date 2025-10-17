import { cn } from "@/lib/utils";

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 28.57 32.74" 
      fill="currentColor" 
      className={cn("h-6 w-6", className)}
    >
      <path d="M28.57,10.63A4.57,4.57,0,0,0,24,6.06V21.43a8,8,0,1,1-8-8v4.73a3.27,3.27,0,1,0,3.27,3.27V6.06A9.2,9.2,0,0,1,10.14.33,9.09,9.09,0,0,1,19.23,0c.06,0,.12,0,.18,0A9.1,9.1,0,0,1,28.57,9.18Z"/>
    </svg>
  );
}
