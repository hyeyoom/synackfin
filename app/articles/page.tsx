import ArticleList from '@/components/articles/ArticleList';
import {createSupabaseClientForServer} from '@/lib/utils/supabase/server';
import {Suspense} from 'react';
import { ArticleWithProfile } from '@/types/database';
import ArticleListSkeleton from '@/components/articles/ArticleListSkeleton';

export default async function ArticlesPage() {
    // 초기 데이터를 서버에서 가져옴
    const supabase = await createSupabaseClientForServer();

    const {data: initialArticles} = await supabase
        .from('user_articles')
        .select(`
            *,
            user_profiles!user_articles_author_id_fkey(name)
        `)
        .eq('board_type', 'articles')
        .order('created_at', {ascending: false})
        .range(0, 9) as { data: ArticleWithProfile[] | null };

    return (
        <main className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">기술 아티클</h1>
            <Suspense fallback={<ArticleListSkeleton/>}>
                <ArticleList initialArticles={initialArticles || []} boardType="articles" />
            </Suspense>
        </main>
    );
} 