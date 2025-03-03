'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { createSupabaseClientForBrowser } from '@/lib/utils/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { extractDomain } from '@/lib/utils/url';
import { stripMarkdown } from '@/lib/utils/markdown';

const ITEMS_PER_PAGE = 10;

export default function Home() {
    const [articles, setArticles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const observer = useRef<IntersectionObserver | null>(null);
    const lastArticleRef = useCallback((node: HTMLElement | null) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);

    const fetchArticles = useCallback(async (pageNum: number) => {
        try {
            setIsLoading(true);
            const supabase = createSupabaseClientForBrowser();

            // 1주일 전 날짜 계산
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const from = pageNum * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data, error } = await supabase
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

            if (error) {
                throw new Error(error.message);
            }

            if (data.length < ITEMS_PER_PAGE) {
                setHasMore(false);
            }

            setArticles(prev => pageNum === 0 ? data : [...prev, ...data]);
        } catch (err) {
            console.error('글 목록을 가져오는 중 오류가 발생했습니다:', err);
            setError('글 목록을 가져오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArticles(page);
    }, [fetchArticles, page]);

    if (error) {
        return (
            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-md">
                    {error}
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-6xl mx-auto px-4 py-8">
            <div className="space-y-4">
                {articles.length > 0 ? (
                    articles.map((article, index) => {
                        // 도메인 추출
                        const domain = article.url ? extractDomain(article.url) : null;

                        // 날짜 포맷팅
                        const createdAt = formatDistanceToNow(new Date(article.created_at), {
                            addSuffix: true,
                            locale: ko
                        });

                        const authorName = article.user_profiles?.name || `사용자 ${article.author_id.substring(0, 8)}`;

                        // 마크다운 제거
                        const plainContent = article.content ? stripMarkdown(article.content).substring(0, 100) : "본문이 없습니다.";

                        // 마지막 아이템에 ref 추가
                        const isLastItem = index === articles.length - 1;

                        return (
                            <article
                                key={article.id}
                                className="flex gap-2"
                                ref={isLastItem ? lastArticleRef : null}
                            >
                                <span className="text-gray-500 w-6 flex-shrink-0">{article.id}.</span>
                                <div className="flex-1">
                                    <div className="flex items-baseline">
                                        <h2 className="text-lg font-medium">
                                            <Link href={`/articles/${article.id}`} className="hover:text-emerald-600 dark:hover:text-emerald-400">
                                                {article.title}
                                            </Link>
                                        </h2>
                                        {domain && (
                                            <span className="ml-2 text-xs text-gray-500">
                                                (<a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    {domain}
                                                </a>)
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center mt-1 ml-1">
                                        <Link href={`/articles/${article.id}`} className="flex items-center w-full">
                                            <div
                                                className="text-sm text-gray-600 dark:text-gray-400 overflow-hidden whitespace-nowrap text-ellipsis max-w-[calc(100%-80px)] hover:underline">
                                                - {plainContent}
                                            </div>
                                            <span
                                                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline ml-2 flex-shrink-0"
                                            >
                                                전체 보기
                                            </span>
                                        </Link>
                                    </div>

                                    <div className="text-xs text-gray-500 ml-1 mt-1">
                                        {article.points} points
                                        by {authorName} | {createdAt} | {article.comment_count || 0} comments
                                    </div>
                                </div>
                            </article>
                        );
                    })
                ) : isLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse flex gap-2">
                                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">아직 게시글이 없습니다.</p>
                        <Link
                            href="/write"
                            className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                        >
                            첫 글 작성하기
                        </Link>
                    </div>
                )}

                {isLoading && articles.length > 0 && (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    </div>
                )}
            </div>
        </main>
    );
}
