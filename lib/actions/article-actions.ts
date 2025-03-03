'use server';

import {createSupabaseClientForServer} from '@/lib/utils/supabase/server';
import {revalidatePath} from 'next/cache';

type BoardType = 'articles' | 'community' | 'jobs';

interface CreateArticleParams {
    title: string;
    url: string | null;
    content: string;
    boardType: BoardType;
}

export async function createArticle(params: CreateArticleParams) {
    try {
        const supabase = await createSupabaseClientForServer();

        // 현재 로그인한 사용자 정보 가져오기
        const {data: {user}} = await supabase.auth.getUser();

        if (!user) {
            return {error: '로그인이 필요합니다.'};
        }

        // 데이터 저장
        const {error} = await supabase
            .from('user_articles')
            .insert({
                title: params.title,
                url: params.url,
                content: params.content,
                author_id: user.id,
                board_type: params.boardType,
                points: 0,
                comment_count: 0
            });

        if (error) {
            console.error('글 저장 오류:', error);
            return {error: error.message};
        }

        // 캐시 무효화
        revalidatePath('/');

        return {success: true};
    } catch (error) {
        console.error('서버 액션 오류:', error);
        return {error: '서버 오류가 발생했습니다.'};
    }
}
