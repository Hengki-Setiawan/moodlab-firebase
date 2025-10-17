import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("font-headline text-2xl font-bold", className)} aria-label="Mood Lab Homepage">
      <span className="bg-gradient-to-r from-gradient-blue via-gradient-purple to-gradient-pink text-transparent bg-clip-text">
        Mood Lab
      </span>
    </Link>
  );
}
