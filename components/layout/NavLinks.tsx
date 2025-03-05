import Link from 'next/link';

export default function NavLinks() {
    return (
        <div className="flex items-center gap-4 text-sm">
            <Link href="/articles" className="text-muted-foreground hover:text-foreground">
                articles
            </Link>
            <Link href="/community" className="text-muted-foreground hover:text-foreground">
                community
            </Link>
        </div>
    );
} 