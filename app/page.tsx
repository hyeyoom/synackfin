import Link from 'next/link';
import { createSupabaseClientForServer } from '@/lib/utils/supabase/server';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { extractDomain } from '@/lib/utils/url';

// 캐싱 설정
export const revalidate = 60; // 60초마다 재검증

export default async function Home() {
  const supabase = await createSupabaseClientForServer();

  // 1주일 전 날짜 계산
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // 서버에서 데이터 가져오기 - articles 타입, 1주일 내, upvote 높은 순
  const { data: articles, error } = await supabase
    .from('user_articles')
    .select('*')
    .eq('board_type', 'articles')
    .gte('created_at', oneWeekAgo.toISOString())
    .order('points', { ascending: false })
    .limit(30);

  // 에러가 있거나 데이터가 없으면 더미 데이터 사용
  const displayArticles = error || !articles || articles.length === 0
    ? []
    : articles;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-4">
        {displayArticles.length > 0 ? (
          displayArticles.map((article, index) => {
            // 도메인 추출
            const domain = article.url ? extractDomain(article.url) : null;

            // 날짜 포맷팅
            const createdAt = formatDistanceToNow(new Date(article.created_at), {
              addSuffix: true,
              locale: ko
            });

            return (
              <article key={article.id} className="flex gap-2">
                <span className="text-gray-500 w-6 flex-shrink-0">{index + 1}.</span>
                <div className="flex flex-col w-full">
                  <div className="flex items-baseline">
                    <button className="text-gray-400 hover:text-emerald-500 mr-3 flex-shrink-0">
                      ▲
                    </button>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      {article.url ? (
                        <a
                          href={article.url}
                          className="text-[15px] font-medium hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {article.title}
                        </a>
                      ) : (
                        <Link
                          href={`/articles/${article.id}`}
                          className="text-[15px] font-medium hover:underline"
                        >
                          {article.title}
                        </Link>
                      )}
                      {domain && (
                        <span className="text-xs text-gray-500">
                          ({domain})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center mt-1 ml-5">
                    <Link href={`/articles/${article.id}`} className="flex items-center w-full">
                      <div className="text-sm text-gray-600 dark:text-gray-400 overflow-hidden whitespace-nowrap text-ellipsis max-w-[calc(100%-80px)] hover:underline">
                        - {article.content ? article.content.substring(0, 100) : "본문이 없습니다."}
                      </div>
                      <span
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline ml-2 flex-shrink-0"
                      >
                        전체 보기
                      </span>
                    </Link>
                  </div>

                  <div className="text-xs text-gray-500 ml-5 mt-1">
                    {article.points} points | {createdAt} | {article.comment_count || 0} comments
                  </div>
                </div>
              </article>
            );
          })
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
      </div>
    </main>
  );
}
