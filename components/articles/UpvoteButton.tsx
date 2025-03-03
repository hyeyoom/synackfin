'use client';

import { useState } from 'react';
import { upvoteArticle } from '@/lib/actions/article-actions';
import { createSupabaseClientForBrowser } from '@/lib/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface UpvoteButtonProps {
  articleId: number;
  initialPoints: number;
  className?: string;
}

export default function UpvoteButton({ articleId, initialPoints, className = '' }: UpvoteButtonProps) {
  const [points, setPoints] = useState(initialPoints);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const router = useRouter();

  const handleUpvote = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createSupabaseClientForBrowser();
      const { data } = await supabase.auth.getUser();
      
      if (!data.user) {
        router.push('/login');
        return;
      }

      const result = await upvoteArticle({ articleId });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.points) {
        setPoints(result.points);
      }
      
      setHasVoted(true);
    } catch (err) {
      console.error('투표 오류:', err);
      setError('투표 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        onClick={handleUpvote}
        disabled={isLoading || hasVoted}
        className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
          hasVoted 
            ? 'text-emerald-500 cursor-not-allowed' 
            : 'text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
        }`}
        aria-label="글 추천하기"
      >
        ▲
      </button>
      <span className={`text-xs font-medium ${hasVoted ? 'text-emerald-500' : ''}`}>{points}</span>
      {error && (
        <div className="text-xs text-red-500 mt-1">{error}</div>
      )}
    </div>
  );
} 