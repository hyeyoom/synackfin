'use client';

import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {ModeToggle} from '@/components/mode-toggle';
import {useEffect, useState} from 'react';
import {createSupabaseClientForBrowser} from '@/lib/utils/supabase/client';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import {User} from "@supabase/auth-js";

export default function Navigation() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createSupabaseClientForBrowser();

    useEffect(() => {
        const getUser = async () => {
            try {
                const {data} = await supabase.auth.getUser();
                setUser(data.user);
            } catch (error) {
                console.error('사용자 정보 가져오기 오류:', error);
            } finally {
                setIsLoading(false);
            }
        };

        getUser();

        const {data: authListener} = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

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
                    <ModeToggle/>
                    {isLoading ? (
                        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                    ) : user ? (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/write">작성하기</Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSignOut}
                            >
                                로그아웃
                            </Button>
                        </div>
                    ) : (
                        <GoogleLoginButton/>
                    )}
                </div>
            </div>
        </nav>
    );
}
