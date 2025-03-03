'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { extractDomain } from '@/lib/utils/url';
import { stripMarkdown } from '@/lib/utils/markdown';
import { Article } from '@/types/article';
import UpvoteButton from '@/components/articles/UpvoteButton';
import useSWRInfinite from 'swr/infinite';
import { createSupabaseClientForBrowser } from '@/lib/utils/supabase/client';

const ITEMS_PER_PAGE = 10;

interface ArticleListProps {
  initialArticles: any[]; // 서버에서 가져온 초기 데이터
}

export default function ArticleList({ initialArticles }: ArticleListProps) {
  // 초기 데이터를 변환
  const transformedInitialData = initialArticles.map(transformArticleData);
  
  // SWR Infinite를 사용하여 데이터 페칭 및 캐싱
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.length) return null;
    return `/api/articles?page=${pageIndex}`;
  };
  
  const fetcher = async (url: string) => {
    const pageIndex = parseInt(url.split('=')[1]);
    
    // 첫 페이지이고 초기 데이터가 있으면 초기 데이터 사용
    if (pageIndex === 0 && transformedInitialData.length > 0) {
      return transformedInitialData;
    }
    
    const supabase = createSupabaseClientForBrowser();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const from = pageIndex * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    
    const { data: rawData } = await supabase
      .from('user_articles')
      .select(`
        *,
        user_profiles!user_articles_author_id_fkey(name)
      `)
      .eq('board_type', 'articles')
      .gte('created_at', oneWeekAgo.toISOString())
      .order('points', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);
      
    return (rawData || []).map(transformArticleData);
  };
  
  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    getKey,
    fetcher,
    {
      fallbackData: transformedInitialData.length > 0 ? [[...transformedInitialData]] : undefined,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false
    }
  );
  
  const articles = data ? data.flat() : [];
  const isLoading = isValidating;
  const hasMore = data && data[data.length - 1]?.length === ITEMS_PER_PAGE;
  
  // 무한 스크롤 구현
  const observer = useRef<IntersectionObserver | null>(null);
  const lastArticleRef = useCallback((node: HTMLElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setSize(size + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, setSize, size]);
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-md">
        글 목록을 가져오는 중 오류가 발생했습니다.
      </div>
    );
  }
  
  if (articles.length === 0 && !isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">아직 게시글이 없습니다.</p>
        <Link
          href="/write"
          className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
        >
          첫 글 작성하기
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {articles.map((article, index) => {
        // 날짜 포맷팅
        const createdAt = formatDistanceToNow(new Date(article.createdAt), {
          addSuffix: true,
          locale: ko
        });
        
        return (
          <article
            key={article.id}
            ref={index === articles.length - 1 ? lastArticleRef : null}
            className="flex gap-4 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <div className="flex flex-col items-center mr-1 w-6">
              <span className="text-gray-500 text-sm">{article.id}.</span>
              <UpvoteButton
                articleId={article.id}
                initialPoints={article.points}
                className="mt-1"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline">
                <h2 className="text-lg font-medium">
                  {article.url ? (
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      {article.title}
                    </a>
                  ) : (
                    <Link 
                      href={`/articles/${article.id}`} 
                      className="hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      {article.title}
                    </Link>
                  )}
                </h2>
                {article.domain && (
                  <span className="ml-2 text-xs text-gray-500">
                    (<a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {article.domain}
                    </a>)
                  </span>
                )}
              </div>

              <div className="flex items-center mt-1">
                <Link href={`/articles/${article.id}`} className="flex items-center w-full">
                  <div
                    className="text-sm text-gray-600 dark:text-gray-400 overflow-hidden whitespace-nowrap text-ellipsis max-w-[calc(100%-80px)] hover:underline"
                  >
                    - {article.summary}
                  </div>
                  <span
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline ml-2 flex-shrink-0"
                  >
                    전체 보기
                  </span>
                </Link>
              </div>

              <div className="text-xs text-gray-500 mt-1">
                {article.points} points
                by {article.author} | {createdAt} | {article.commentCount} comments
              </div>
            </div>
          </article>
        );
      })}
      
      {isLoading && articles.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      )}
    </div>
  );
}

// 데이터 변환 함수
function transformArticleData(item: any): Article {
  return {
    id: item.id,
    title: item.title,
    url: item.url || '',
    points: item.points,
    author: item.user_profiles?.name || `사용자 ${item.author_id.substring(0, 8)}`,
    createdAt: item.created_at,
    commentCount: item.comment_count || 0,
    domain: item.url ? extractDomain(item.url) || '' : '',
    summary: item.content ? stripMarkdown(item.content).substring(0, 100) : '본문이 없습니다.'
  };
} 