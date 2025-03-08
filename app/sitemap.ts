import {createSupabaseClientForServer} from '@/lib/utils/supabase/server';
import {MetadataRoute} from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 기본 URL은 환경 변수에서 가져오며, 설정되지 않았을 경우 개발 환경용 URL 사용
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const supabase = await createSupabaseClientForServer();

    // 정적 페이지
    const staticPages = [
        {
            url: `${baseUrl}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/articles`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/community`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.8,
        },
    ];

    // 게시글 페이지
    const {data: articles} = await supabase
        .from('user_articles')
        .select('id, created_at, updated_at')
        .eq('board_type', 'articles')
        .order('created_at', {ascending: false})
        .limit(1000); // 최근 1000개 게시글만 포함

    const articlePages = articles?.map((article) => ({
        url: `${baseUrl}/articles/${article.id}`,
        lastModified: new Date(article.updated_at || article.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    })) || [];

    // 커뮤니티 게시글 페이지
    const {data: communityPosts} = await supabase
        .from('user_articles')
        .select('id, created_at, updated_at')
        .eq('board_type', 'community')
        .order('created_at', {ascending: false})
        .limit(1000);

    const communityPages = communityPosts?.map((post) => ({
        url: `${baseUrl}/community/${post.id}`,
        lastModified: new Date(post.updated_at || post.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
    })) || [];

    // 사용자 페이지는 제외 (users/)
    // 모든 페이지 합치기
    return [...staticPages, ...articlePages, ...communityPages];
}
