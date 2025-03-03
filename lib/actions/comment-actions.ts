'use server';

import { createSupabaseClientForServer } from '@/lib/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Tables } from '@/lib/utils/supabase/supabase';

export type Comment = Tables<'user_comments'> & {
  user_profiles?: {
    name: string | null;
  };
  replies?: (Comment)[];
};

interface CreateCommentParams {
  articleId: number;
  content: string;
  responseToId?: number | null;
}

export async function createComment(params: CreateCommentParams) {
  try {
    const supabase = await createSupabaseClientForServer();

    // 현재 로그인한 사용자 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: '로그인이 필요합니다.' };
    }

    // 댓글 저장
    const { data: comment, error } = await supabase
      .from('user_comments')
      .insert({
        article_id: params.articleId,
        content: params.content,
        author_id: user.id,
        response_to: params.responseToId || null
      })
      .select()
      .single();

    if (error) {
      console.error('댓글 저장 오류:', error);
      return { error: error.message };
    }

    // 댓글 수 업데이트 - 모든 댓글 수를 다시 계산
    const { data: allComments } = await supabase
      .from('user_comments')
      .select('id')
      .eq('article_id', params.articleId);
      
    const totalCommentCount = allComments?.length || 0;
    
    await supabase
      .from('user_articles')
      .update({ comment_count: totalCommentCount })
      .eq('id', params.articleId);

    // 캐시 무효화
    revalidatePath(`/articles/${params.articleId}`);

    return { success: true, comment };
  } catch (error) {
    console.error('서버 액션 오류:', error);
    return { error: '서버 오류가 발생했습니다.' };
  }
}

export async function getComments(articleId: number) {
  try {
    const supabase = await createSupabaseClientForServer();

    // 모든 댓글 가져오기
    const { data: comments, error } = await supabase
      .from('user_comments')
      .select(`
        *,
        user_profiles!user_comments_author_id_fkey(name)
      `)
      .eq('article_id', articleId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('댓글 조회 오류:', error);
      return { error: error.message };
    }

    // 댓글 계층 구조 만들기
    const rootComments: Comment[] = [];
    const commentMap = new Map<number, Comment>();

    // 모든 댓글을 맵에 저장
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // 댓글 계층 구조 구성
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      
      if (comment.response_to === null) {
        // 루트 댓글
        rootComments.push(commentWithReplies);
      } else {
        // 답글
        const parentComment = commentMap.get(comment.response_to);
        if (parentComment) {
          parentComment.replies = parentComment.replies || [];
          parentComment.replies.push(commentWithReplies);
        }
      }
    });

    return { comments: rootComments };
  } catch (error) {
    console.error('댓글 조회 오류:', error);
    return { error: '댓글을 불러오는 중 오류가 발생했습니다.' };
  }
} 