'use client';

import {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {createSupabaseClientForBrowser} from '@/lib/utils/supabase/client';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import {User} from "@supabase/auth-js";
import { PenSquare, UserCircle, LogOut } from "lucide-react";

export default function UserAuthSection() {
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
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                    asChild
                    title="글 작성하기"
                >
                    <Link href="/write">
                        <PenSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </Link>
                </Button>
                
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                    asChild
                    title="프로필 관리"
                >
                    <Link href="/profile">
                        <UserCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </Link>
                </Button>
                
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="relative rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                    title="로그아웃"
                >
                    <LogOut className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </Button>
            </div>
        );
    }

    return <GoogleLoginButton/>;
}
