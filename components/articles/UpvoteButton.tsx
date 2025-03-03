'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [showDialog, setShowDialog] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 다이얼로그 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setShowDialog(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 컴포넌트 마운트 시 이미 투표했는지 확인
  useEffect(() => {
    const checkVoteStatus = async () => {
      try {
        const supabase = createSupabaseClientForBrowser();
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) return;
        
        const { data: existingVote } = await supabase
          .from('user_votes')
          .select('id')
          .eq('author_id', userData.user.id)
          .eq('article_id', articleId)
          .single();
          
        if (existingVote) {
          setHasVoted(true);
        }
      } catch (err) {
        // 에러 무시 (single() 호출 시 결과가 없으면 에러 발생)
      }
    };
    
    checkVoteStatus();
  }, [articleId]);

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
        setShowDialog(true);
        return;
      }

      if (result.points) {
        setPoints(result.points);
      }
      
      setHasVoted(true);
    } catch (err) {
      console.error('투표 오류:', err);
      setError('투표 처리 중 오류가 발생했습니다.');
      setShowDialog(true);
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
      
      {/* 에러 다이얼로그 */}
      {showDialog && error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={dialogRef}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm mx-auto"
          >
            <h3 className="text-lg font-medium mb-2">알림</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
            <button
              onClick={() => setShowDialog(false)}
              className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 