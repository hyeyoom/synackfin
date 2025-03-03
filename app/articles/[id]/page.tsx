import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseClientForServer } from '@/lib/utils/supabase/server';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { extractDomain } from '@/lib/utils/url';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import {Metadata} from 'next';
import CommentSection from '@/components/comments/CommentSection';

interface Props {
    params: {
        id: string;
    };
}

export const revalidate = 60; // 60초마다 재검증

// 동적 메타데이터 생성
export async function generateMetadata({params}: Props): Promise<Metadata> {
    const id = parseInt(params.id);
    const supabase = await createSupabaseClientForServer();

    // 실제 데이터 가져오기
    const { data: article, error } = await supabase
        .from('user_articles')
        .select(`
            *,
            user_profiles!user_articles_author_id_fkey(name)
        `)
        .eq('id', id)
        .single();

    if (error || !article) {
        return {
            title: '아티클을 찾을 수 없습니다 - 엔지니어링 뉴스',
            description: '요청하신 아티클을 찾을 수 없습니다.'
        };
    }

    // 작성자 정보 처리
    const authorName = article.user_profiles?.name || `사용자 ${article.author_id.substring(0, 8)}`;

    return {
        title: `${article.title} - 엔지니어링 뉴스`,
        description: article.content?.substring(0, 160) || '엔지니어링 뉴스 아티클',
        openGraph: {
            title: article.title,
            description: article.content?.substring(0, 160) || '엔지니어링 뉴스 아티클',
            type: 'article',
            authors: [authorName],
            publishedTime: article.created_at
        }
    };
}

export default async function ArticlePage({params}: Props) {
    const id = parseInt(params.id);
    const supabase = await createSupabaseClientForServer();

    // 실제 데이터 가져오기
    const { data: article, error } = await supabase
        .from('user_articles')
        .select(`
            *,
            user_profiles!user_articles_author_id_fkey(name)
        `)
        .eq('id', id)
        .single();

    if (error || !article) {
        notFound();
    }

    // 작성자 정보 처리
    const authorName = article.user_profiles?.name || `사용자 ${article.author_id.substring(0, 8)}`;

    // 날짜 포맷팅
    const createdAt = formatDistanceToNow(new Date(article.created_at), {
        addSuffix: true,
        locale: ko
    });

    // 도메인 추출
    const domain = article.url ? extractDomain(article.url) : null;

    return (
        <main className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-4">
                <Link href="/" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                    ← 홈으로 돌아가기
                </Link>
            </div>

            <article>
                <h1 className="text-3xl font-bold mb-2">{article.title}</h1>

                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                    <span>{authorName}</span>
                    <span>•</span>
                    <span>{createdAt}</span>
                    <span>•</span>
                    <span>{article.points} points</span>
                    {article.url && (
                        <>
                            <span>•</span>
                            <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                                원본 링크 {domain && `(${domain})`}
                            </a>
                        </>
                    )}
                </div>

                <div className="prose dark:prose-invert prose-sm max-w-none my-4">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypeHighlight]}
                    >
                        {article.content || ''}
                    </ReactMarkdown>
                </div>

                <CommentSection articleId={article.id} />
            </article>
        </main>
    );
}
