import { createSupabaseClientForServer } from '@/lib/utils/supabase/server';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface PageProps {
  params: {
    username: string;
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = params;
  const decodedUsername = decodeURIComponent(username);
  const supabase = await createSupabaseClientForServer();

  // 사용자 프로필 가져오기
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('name, bio, created_at, author_id')
    .eq('name', decodedUsername)
    .single();

  // 프로필이 없으면 오류 메시지 표시
  if (error || !profile) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
            ← 홈으로 돌아가기
          </Link>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-md">
          사용자를 찾을 수 없습니다.
        </div>
      </main>
    );
  }

  // 작성한 글 갯수
  const { count: articleCount } = await supabase
    .from('user_articles')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', profile.author_id);

  // 작성한 댓글 갯수
  const { count: commentCount } = await supabase
    .from('user_comments')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', profile.author_id);

  // 받은 업보트(포인트) 총합
  const { data: upvotes } = await supabase
    .from('user_articles')
    .select('points')
    .eq('author_id', profile.author_id);

  const totalPoints = upvotes?.reduce((sum, article) => sum + (article.points || 0), 0) || 0;

  // 가입일 계산
  const joinedDate = formatDistanceToNow(new Date(profile.created_at), {
    addSuffix: true,
    locale: ko
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
          ← 홈으로 돌아가기
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            가입일: {joinedDate}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{articleCount || 0}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">작성 글</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{commentCount || 0}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">작성 댓글</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalPoints}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">받은 포인트</div>
          </div>
        </div>

        {profile.bio && (
          <div className="pb-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-medium mb-2">Bio</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}
      </div>
    </main>
  );
}
