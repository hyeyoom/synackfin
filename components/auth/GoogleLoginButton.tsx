'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {createSupabaseClientForBrowser} from "@/lib/utils/supabase/client";

export default function GoogleLoginButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setIsLoading(true);
            const supabase = createSupabaseClientForBrowser();

            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
        } catch (error) {
            console.error('로그인 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleLogin}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
        >
            {isLoading ? (
                <span>Signing In...</span>
            ) : (
                <>
                    <GoogleIcon/>
                    <span>Sign In</span>
                </>
            )}
        </Button>
    );
}

function GoogleIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M43.611 20.083H42V20H24V28H35.303C33.654 32.657 29.223 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.618 9.382C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24C4 35.045 12.955 44 24 44C35.045 44 44 35.045 44 24C44 22.659 43.862 21.35 43.611 20.083Z"
                fill="#FFC107"/>
            <path
                d="M6.306 14.691L12.877 19.51C14.655 15.108 18.961 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.618 9.382C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691Z"
                fill="#FF3D00"/>
            <path
                d="M24 44C29.166 44 33.86 42.023 37.409 38.808L31.219 33.57C29.211 35.091 26.715 36 24 36C18.798 36 14.381 32.683 12.717 28.054L6.195 33.079C9.505 39.556 16.227 44 24 44Z"
                fill="#4CAF50"/>
            <path
                d="M43.611 20.083H42V20H24V28H35.303C34.511 30.237 33.072 32.166 31.216 33.571L31.219 33.57L37.409 38.808C36.971 39.205 44 34 44 24C44 22.659 43.862 21.35 43.611 20.083Z"
                fill="#1976D2"/>
        </svg>
    );
}
