import { dummyArticles } from '@/data/dummyArticles';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string }
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseInt(params.id);
  const article = dummyArticles.find(article => article.id === id);
  
  if (!article) {
    return {
      title: '아티클을 찾을 수 없습니다 - 엔지니어링 뉴스',
      description: '요청하신 아티클을 찾을 수 없습니다.'
    };
  }
  
  return {
    title: `${article.title} - 엔지니어링 뉴스`,
    description: article.summary?.substring(0, 160) || '엔지니어링 뉴스 아티클',
    openGraph: {
      title: article.title,
      description: article.summary?.substring(0, 160) || '엔지니어링 뉴스 아티클',
      type: 'article',
      authors: [article.author],
      publishedTime: article.createdAt
    }
  };
}

export default function ArticlePage({ params }: Props) {
  const id = parseInt(params.id);
  const article = dummyArticles.find(article => article.id === id);
  
  if (!article) {
    notFound();
  }
  
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
          ← 홈으로 돌아가기
        </Link>
      </div>
      
      <article className="prose dark:prose-invert lg:prose-lg max-w-none">
        <h1>{article.title}</h1>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <span>{article.author}</span>
          <span>•</span>
          <span>{article.createdAt}</span>
          <span>•</span>
          <span>{article.points} points</span>
          <span>•</span>
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            원본 링크 {article.domain && `(${article.domain})`}
          </a>
        </div>
        
        {article.summary && (
          <div className="my-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <h2 className="text-lg font-medium mb-2">요약</h2>
            <p>{article.summary}</p>
          </div>
        )}
        
        <div className="my-8">
          <h2 className="text-xl font-medium mb-4">댓글 ({article.commentCount})</h2>
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
            <p className="text-gray-500">댓글을 보려면 로그인이 필요합니다.</p>
            <Link 
              href="/login"
              className="mt-2 inline-block px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
} 