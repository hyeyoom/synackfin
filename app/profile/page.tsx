'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { checkUserProfile, createUserProfile, updateUserProfile } from '@/lib/actions/profile-actions';
import { createSupabaseClientForBrowser } from '@/lib/utils/supabase/client';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectReason, setRedirectReason] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const supabase = createSupabaseClientForBrowser();
        const { data } = await supabase.auth.getUser();
        
        if (!data.user) {
          router.push('/auth/signin');
          return;
        }
        
        const result = await checkUserProfile();
        
        if (result.error) {
          setError(result.error);
          return;
        }
        
        // URL 파라미터에서 리다이렉트 이유 확인
        const urlParams = new URLSearchParams(window.location.search);
        const reason = urlParams.get('reason');
        if (reason) {
          setRedirectReason(reason);
        }
        
        // 프로필이 있으면 기존 정보 표시
        if (result.hasProfile && result.profile) {
          setHasProfile(true);
          setName(result.profile.name || '');
          setBio(result.profile.bio || '');
        }
      } catch (err) {
        console.error('프로필 확인 오류:', err);
        setError('프로필 정보를 확인하는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // 프로필이 있으면 업데이트, 없으면 생성
      const result = hasProfile
        ? await updateUserProfile({
            name: name.trim(),
            bio: bio.trim() || undefined
          })
        : await createUserProfile({
            name: name.trim(),
            bio: bio.trim() || undefined
          });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // 성공 메시지 표시 후 리다이렉트
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      
      if (redirect) {
        router.push(redirect);
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      console.error('프로필 저장 오류:', err);
      setError(err instanceof Error ? err.message : '프로필을 저장하는 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {hasProfile ? '프로필 수정' : '프로필 설정'}
      </h1>
      
      {redirectReason === 'write' && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-md">
          <p>글을 작성하기 전에 프로필 정보를 입력해주세요.</p>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">이름 (필수)</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">자기소개 (선택사항)</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="간단한 자기소개를 입력하세요"
            className="w-full h-32"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? '저장 중...' : (hasProfile ? '프로필 업데이트' : '프로필 저장')}
        </Button>
      </form>
    </div>
  );
} 