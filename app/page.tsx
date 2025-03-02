import { dummyArticles } from '@/data/dummyArticles';

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-2">
        {dummyArticles.map((article, index) => (
          <article key={article.id} className="flex gap-2">
            <span className="text-gray-500 w-6">{index + 1}.</span>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <a 
                  href={article.url}
                  className="text-[15px] hover:underline"
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
              <div className="text-xs text-gray-500">
                {article.points} points by {article.author} {article.createdAt} | {article.commentCount} comments
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
