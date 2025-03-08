'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ModeToggle } from '@/components/mode-toggle';
import NavLinks from './NavLinks';
import UserAuthSection from './UserAuthSection';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="border-b bg-background sticky top-0 z-10">
            {/* 데스크톱 & 모바일 헤더 */}
            <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" onClick={closeMenu} className="text-emerald-700 dark:text-emerald-500 font-bold">
                        c0ffee.in ☕️
                    </Link>
                    {/* 데스크톱에서만 보이는 네비게이션 링크 */}
                    <div className="hidden md:block">
                        <NavLinks />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <ModeToggle />
                    {/* 데스크톱에서만 보이는 인증 섹션 */}
                    <div className="hidden md:block">
                        <UserAuthSection />
                    </div>
                    {/* 모바일에서만 보이는 메뉴 버튼 */}
                    <button 
                        className="md:hidden p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={toggleMenu}
                        aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>
            
            {/* 모바일 메뉴 */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-background">
                    <div className="max-w-6xl mx-auto px-4 py-3">
                        {/* 모바일에서 보이는 네비게이션 링크 */}
                        <div className="mb-3">
                            <NavLinks onClick={closeMenu} />
                        </div>
                        {/* 모바일에서 보이는 인증 섹션 */}
                        <div>
                            <UserAuthSection />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
