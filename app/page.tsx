import { dummyArticles } from '@/data/dummyArticles';

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-4">
        {dummyArticles.map((article, index) => (
          <article key={article.id} className="flex gap-2">
            <span className="text-gray-500 w-6">{index + 1}.</span>
            <div className="flex flex-col w-full">
              <div className="flex items-baseline gap-2">
                <button className="text-gray-400 hover:text-emerald-500 mr-1">
                  ▲
                </button>
                <a 
                  href={article.url}
                  className="text-[15px] font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {article.title}
                </a>
                {article.domain && (
                  <span className="text-xs text-gray-500">
                    ({article.domain})
                  </span>
                )}
              </div>
              
              {/* 본문 요약 - 한 줄로 제한하고 말줄임표 적용 */}
              <div className="flex items-center mt-1 ml-5">
                <div className="text-sm text-gray-600 dark:text-gray-400 overflow-hidden whitespace-nowrap text-ellipsis max-w-[calc(100%-80px)]">
                  - {article.summary || "본문 요약이 제공되지 않았습니다."}
                </div>
                <a 
                  href="/articles/summary"
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline ml-2 flex-shrink-0"
                >
                  전체 보기
                </a>
              </div>
              
              <div className="text-xs text-gray-500 ml-5 mt-1">
                {article.points} points by {article.author} {article.createdAt} | {article.commentCount} comments
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
