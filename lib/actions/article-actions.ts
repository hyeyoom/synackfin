'use server';

import {createSupabaseClientForServer} from '@/lib/utils/supabase/server';
import {revalidatePath} from 'next/cache';

type BoardType = 'articles' | 'community';

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

// upvote 함수 타입 정의
interface UpvoteArticleParams {
    articleId: number;
}

export async function upvoteArticle(params: UpvoteArticleParams) {
    try {
        const supabase = await createSupabaseClientForServer();

        // 현재 로그인한 사용자 정보 가져오기
        const {data: {user}} = await supabase.auth.getUser();

        if (!user) {
            return {error: '로그인이 필요합니다.'};
        }

        // 이미 투표했는지 확인
        const {data: existingVote} = await supabase
            .from('user_votes')
            .select('id')
            .eq('author_id', user.id)
            .eq('article_id', params.articleId)
            .single();

        if (existingVote) {
            return {error: '이미 이 글에 투표하셨습니다.'};
        }

        // 투표 기록 저장
        const {error: voteError} = await supabase
            .from('user_votes')
            .insert({
                author_id: user.id,
                article_id: params.articleId
            });

        if (voteError) {
            console.error('투표 저장 오류:', voteError);
            return {error: voteError.message};
        }

        // RPC 함수를 사용하여 포인트 증가
        const {data: newPoints, error: rpcError} = await supabase
            .rpc('increment_points', {row_id: params.articleId});

        if (rpcError) {
            console.error('포인트 증가 오류:', rpcError);
            return {error: rpcError.message};
        }

        // 캐시 무효화
        revalidatePath('/');
        revalidatePath(`/articles/${params.articleId}`);

        return {success: true, points: newPoints};
    } catch (error) {
        console.error('서버 액션 오류:', error);
        return {error: '서버 오류가 발생했습니다.'};
    }
}

interface UpdateArticleParams {
    id: number;
    title: string;
    url: string | null;
    content: string;
    boardType: BoardType;
}

export async function updateArticle(params: UpdateArticleParams) {
    try {
        const supabase = await createSupabaseClientForServer();

        // 현재 로그인한 사용자 정보 가져오기
        const {data: {user}} = await supabase.auth.getUser();

        if (!user) {
            return {error: '로그인이 필요합니다.'};
        }

        // 글 소유자 확인
        const { data: article } = await supabase
            .from('user_articles')
            .select('author_id')
            .eq('id', params.id)
            .single();

        if (!article) {
            return {error: '글을 찾을 수 없습니다.'};
        }

        if (article.author_id !== user.id) {
            return {error: '글 수정 권한이 없습니다.'};
        }

        // 데이터 업데이트
        const {error} = await supabase
            .from('user_articles')
            .update({
                title: params.title,
                url: params.url,
                content: params.content,
                board_type: params.boardType,
                updated_at: new Date().toISOString()
            })
            .eq('id', params.id);

        if (error) {
            console.error('글 수정 오류:', error);
            return {error: error.message};
        }

        // 캐시 무효화
        revalidatePath('/');
        revalidatePath(`/articles/${params.id}`);

        return {success: true};
    } catch (error) {
        console.error('서버 액션 오류:', error);
        return {error: '서버 오류가 발생했습니다.'};
    }
}
