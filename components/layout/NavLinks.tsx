import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinksProps {
    onClick?: () => void;
}

export default function NavLinks({ onClick }: NavLinksProps = {}) {
    const pathname = usePathname();

    // 현재 경로에 따라 active 스타일 적용
    const isActive = (path: string) =>
        pathname === path ? 'text-emerald-600 dark:text-emerald-400 font-medium' : '';

    const handleClick = () => {
        if (onClick) onClick();
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <Link
                href="/articles"
                onClick={handleClick}
                className={`hover:text-emerald-600 dark:hover:text-emerald-400 ${isActive('/articles')}`}
            >
                articles
            </Link>
            <Link
                href="/knowledge"
                onClick={handleClick}
                className={`hover:text-emerald-600 dark:hover:text-emerald-400 ${isActive('/articles')}`}
            >
                knowledge
            </Link>
            <Link
                href="/community"
                onClick={handleClick}
                className={`hover:text-emerald-600 dark:hover:text-emerald-400 ${isActive('/community')}`}
            >
                community
            </Link>
        </div>
    );
}
