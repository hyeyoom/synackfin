'use client';

import { useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createSupabaseClientForBrowser } from '@/lib/utils/supabase/client';
import { upvoteArticle } from '@/lib/actions/article-actions';

interface UpvoteButtonProps {
  articleId: number;
  initialPoints: number;
  className?: string;
  onPointsUpdate?: (points: number) => void;
}

export default function UpvoteButton({ 
  articleId, 
  initialPoints, 
  className = '',
  onPointsUpdate
}: UpvoteButtonProps) {
  const [points, setPoints] = useState(initialPoints);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpvote = async () => {
    try {
      setIsLoading(true);

      const supabase = createSupabaseClientForBrowser();
      const { data } = await supabase.auth.getUser();
      
      if (!data.user) {
        router.push('/login');
        return;
      }

      const result = await upvoteArticle({ articleId });

      if (result.error) {
        alert(result.error);
        return;
      }

      if (result.points) {
        setPoints(result.points);
        
        // 부모 컴포넌트에 포인트 업데이트 알림
        if (onPointsUpdate) {
          onPointsUpdate(result.points);
        }
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
      alert('투표 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 포인트가 있으면 버튼도 초록색으로 하이라이트
  const buttonColorClass = points > 0 
    ? 'text-emerald-500 hover:text-emerald-600' 
    : 'text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        id={`upvote-btn-${articleId}`}
        onClick={handleUpvote}
        disabled={isLoading}
        className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${buttonColorClass}`}
        aria-label="글 추천하기"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
      <span className={`text-xs font-medium ${points > 0 ? 'text-emerald-500' : ''}`}>
        {points}
      </span>
    </div>
  );
} 