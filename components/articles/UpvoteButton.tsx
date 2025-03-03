'use client';

import { useState, useRef } from 'react';
import { upvoteArticle } from '@/lib/actions/article-actions';
import { createSupabaseClientForBrowser } from '@/lib/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';

interface UpvoteButtonProps {
  articleId: number;
  initialPoints: number;
  className?: string;
}

export default function UpvoteButton({ articleId, initialPoints, className = '' }: UpvoteButtonProps) {
  const [points, setPoints] = useState(initialPoints);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 다이얼로그 외부 클릭 시 닫기
  const handleClickOutside = (event: MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
      setShowDialog(false);
    }
  };

  // 다이얼로그가 표시될 때만 이벤트 리스너 추가
  if (showDialog) {
    document.addEventListener('mousedown', handleClickOutside, { once: true });
  }

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
        
        // SWR 캐시 업데이트
        mutate(
          (key) => typeof key === 'string' && key.startsWith('/api/articles'),
          undefined,
          { revalidate: true }
        );
      }
      
      // 업보트 성공 시 버튼 색상 변경
      const button = document.getElementById(`upvote-btn-${articleId}`);
      if (button) {
        button.classList.add('text-emerald-500');
        button.classList.add('cursor-not-allowed');
        button.setAttribute('disabled', 'true');
      }
      
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
        id={`upvote-btn-${articleId}`}
        onClick={handleUpvote}
        disabled={isLoading}
        className="flex items-center justify-center w-8 h-8 rounded-md transition-colors text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
        aria-label="글 추천하기"
      >
        ▲
      </button>
      <span className="text-xs font-medium">{points}</span>
      
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