'use client';

import {useCallback, useRef, useState} from 'react';
import Link from 'next/link';
import {formatDistanceToNow} from 'date-fns';
import {ko} from 'date-fns/locale';
import {extractDomain} from '@/lib/utils/url';
import {stripMarkdown} from '@/lib/utils/markdown';
import {Article} from '@/types/article';
import UpvoteButton from '@/components/articles/UpvoteButton';
import {createSupabaseClientForBrowser} from '@/lib/utils/supabase/client';
import {ArticleWithProfile} from '@/types/database';

const ITEMS_PER_PAGE = 10;

interface ArticleListProps {
    initialArticles: ArticleWithProfile[];
    boardType?: 'articles' | 'community';
    useWeeklyFilter?: boolean;
    orderByPoints?: boolean;
}

export default function ArticleList({
    initialArticles, 
    boardType = 'articles',
    useWeeklyFilter = false,  // 1주일 필터 적용 여부
    orderByPoints = false     // 포인트순 정렬 여부
}: ArticleListProps) {
    // 상태 관리
    const [articles, setArticles] = useState<Article[]>(initialArticles.map(transformArticleData));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    
    // 추가 데이터 로드 함수 - useCallback으로 감싸기
    const loadMoreArticles = useCallback(async () => {
        if (isLoading || !hasMore) return;
        
        try {
            setIsLoading(true);
            
            const nextPage = page + 1;
            // 첫 페이지이고 초기 데이터가 있으면 초기 데이터 사용
            if (nextPage === 0 && initialArticles.length > 0) {
                return;
            }
            
            const supabase = createSupabaseClientForBrowser();
            const from = nextPage * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;
            
            // 기본 쿼리 설정
            let query = supabase
                .from('user_articles')
                .select(`
                    *,
                    user_profiles!user_articles_author_id_fkey(name)
                `)
                .eq('board_type', boardType);
            
            // 1주일 필터 적용 (메인 페이지용)
            if (useWeeklyFilter) {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                query = query.gte('created_at', oneWeekAgo.toISOString());
            }
            
            // 정렬 조건 적용
            if (orderByPoints) {
                query = query.order('points', {ascending: false});
            }
            
            // 항상 날짜순으로 정렬 (2차 정렬)
            query = query.order('created_at', {ascending: false});
            
            const {data: rawData} = await query.range(from, to) as { data: ArticleWithProfile[] | null };
            
            const newArticles = (rawData || []).map(transformArticleData);
            
            // 중복 제거 로직 추가
            const existingIds = articles.map(a => a.id);
            const uniqueNewArticles = newArticles.filter(a => !existingIds.includes(a.id));
            
            setArticles(prev => [...prev, ...uniqueNewArticles]);
            setPage(nextPage);
            setHasMore(newArticles.length > 0);  // 마지막 페이지 처리 개선
        } catch (err) {
            console.error('글 목록 가져오기 오류:', err);
            setError('글 목록을 가져오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, page, articles, boardType, useWeeklyFilter, orderByPoints, initialArticles.length]);
    
    // 무한 스크롤 구현
    const observer = useRef<IntersectionObserver | null>(null);
    const lastArticleRef = useCallback((node: HTMLElement | null) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreArticles();
            }
        });
        
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore, loadMoreArticles]);
    
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
                                onPointsUpdate={(newPoints) => {
                                    setArticles(prev => 
                                        prev.map(a => a.id === article.id ? {...a, points: newPoints} : a)
                                    );
                                }}
                            />
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex items-center gap-1">
                                <h2 className="text-lg font-medium">
                                    {article.url ? (
                                        <a
                                            href={article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline"
                                        >
                                            {article.title}
                                        </a>
                                    ) : (
                                        <Link href={`/articles/${article.id}`} className="hover:underline">
                                            {article.title}
                                        </Link>
                                    )}
                                </h2>
                                {article.domain && (
                                    <span className="text-xs text-gray-500">({article.domain})</span>
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
function transformArticleData(item: ArticleWithProfile): Article {
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
