'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createSupabaseClientForBrowser } from '@/lib/utils/supabase/client';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import { User } from "@supabase/auth-js";

export default function UserAuthSection() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createSupabaseClientForBrowser();

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data } = await supabase.auth.getUser();
                setUser(data.user);
            } catch (error) {
                console.error('사용자 정보 가져오기 오류:', error);
            } finally {
                setIsLoading(false);
            }
        };

        getUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [supabase.auth]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    if (isLoading) {
        return <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>;
    }

    if (user) {
        return (
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
        );
    }

    return <GoogleLoginButton />;
} 