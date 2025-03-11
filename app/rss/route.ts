import { createSupabaseClientForServer } from '@/lib/utils/supabase/server';
import { ArticleWithProfile } from '@/types/database';
import { format } from 'date-fns';
import {stripMarkdown} from "@/lib/utils/markdown";

// RSS 피드 최대 항목 수
const MAX_FEED_ITEMS = 20;

// 요약 생성 함수 (최대 길이 제한)
function createSummary(content: string, maxLength: number = 300): string {
  if (!content) return '';

  // 마크다운 요소 제거
  const plainText = stripMarkdown(content);

  // 길이 제한
  if (plainText.length <= maxLength) return plainText;

  // 최대 길이로 자르고 '...' 추가
  return plainText.substring(0, maxLength) + '...';
}

// RSS 피드 생성 함수
function generateRssFeed(articles: ArticleWithProfile[]) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-site-url.com';

  // 현재 날짜와 시간을 RFC822 형식으로 포맷
  const now = new Date();
  const buildDate = format(now, 'EEE, dd MMM yyyy HH:mm:ss xx');

  // RSS 헤더 생성
  let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>엔지니어링 뉴스 플랫폼</title>
  <link>${baseUrl}</link>
  <description>소프트웨어 엔지니어들을 위한 최신 엔지니어링 뉴스와 아티클</description>
  <lastBuildDate>${buildDate}</lastBuildDate>
  <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml" />
`;

  // 각 게시글을 RSS 항목으로 변환
  articles.forEach((article) => {
    const pubDate = format(new Date(article.created_at), 'EEE, dd MMM yyyy HH:mm:ss xx');
    const authorName = article.user_profiles?.name || '익명';
    const articleUrl = `${baseUrl}/articles/${article.id}`;

    // 콘텐츠 준비 (마크다운 제거 및 HTML 이스케이프 처리)
    const summary = article.content ?
      createSummary(article.content)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;') :
      '';

    // 각 항목 추가
    xml += `  <item>
    <title>${article.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
    <link>${articleUrl}</link>
    <guid>${articleUrl}</guid>
    <pubDate>${pubDate}</pubDate>
    <author>${authorName}</author>
    <description><![CDATA[${summary}]]></description>
  </item>
`;
  });

  // RSS 푸터 추가
  xml += `</channel>
</rss>`;

  return xml;
}

// RSS 피드 API 라우트 핸들러
export async function GET() {
  const supabase = await createSupabaseClientForServer();

  // 최신 게시글 가져오기
  const { data: articles } = await supabase
    .from('user_articles')
    .select(`
      *,
      user_profiles!user_articles_author_id_fkey(name)
    `)
    .order('created_at', { ascending: false })
    .limit(MAX_FEED_ITEMS) as { data: ArticleWithProfile[] | null };

  // RSS 피드 생성
  const feed = generateRssFeed(articles || []);

  // XML 응답 반환
  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600' // 1시간 캐싱
    }
  });
}
