import ArticleList from '@/components/articles/ArticleList';
import {createSupabaseClientForServer} from '@/lib/utils/supabase/server';
import {Suspense} from 'react';
import {ArticleWithProfile} from '@/types/database';

export default async function Home() {
    // 초기 데이터를 서버에서 가져옴
    const supabase = await createSupabaseClientForServer();

    // 1주일 전 날짜 계산
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 90);

    const {data: initialArticles} = await supabase
        .from('user_articles')
        .select(`
            *,
            user_profiles!user_articles_author_id_fkey(name)
        `)
        .gte('created_at', oneWeekAgo.toISOString())
        .order('points', {ascending: false})
        .order('created_at', {ascending: false})
        .range(0, 9) as { data: ArticleWithProfile[] | null };

    return (
        <main className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">최근 3달</h1>
            <Suspense fallback={<ArticleListSkeleton/>}>
                <ArticleList
                    initialArticles={initialArticles || []}
                    useWeeklyFilter={true}  // 1주일 필터 적용
                    orderByPoints={true}    // 포인트순 정렬 적용
                />
            </Suspense>
        </main>
    );
}

function ArticleListSkeleton() {
    return (
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
    );
}
