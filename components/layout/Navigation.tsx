import Link from 'next/link';
import { ModeToggle } from '@/components/mode-toggle';
import NavLinks from './NavLinks';
import UserAuthSection from './UserAuthSection';

export default function Navigation() {
    return (
        <nav className="border-b bg-background">
            <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-emerald-700 dark:text-emerald-500 font-bold">
                        eng.center
                    </Link>
                    <NavLinks />
                </div>

                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <UserAuthSection />
                </div>
            </div>
        </nav>
    );
}
