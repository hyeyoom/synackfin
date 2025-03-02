'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';


export default function Navigation() {
  return (
    <nav className="border-b bg-background">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-emerald-700 dark:text-emerald-500 font-bold">
            eng.center
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/articles" className="text-muted-foreground hover:text-foreground">
              articles
            </Link>
            <Link href="/community" className="text-muted-foreground hover:text-foreground">
              community
            </Link>
            <Link href="/jobs" className="text-muted-foreground hover:text-foreground">
              jobs
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">login</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
