'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { createSupabaseClientForBrowser } from '@/lib/utils/supabase/client';
import { Comment, createComment, getComments } from '@/lib/actions/comment-actions';
import {User} from '@supabase/supabase-js'
import Link from 'next/link';

interface CommentSectionProps {
  articleId: number;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCommentCount, setTotalCommentCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number; author: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createSupabaseClientForBrowser();

  // 사용자 정보 가져오기
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch (error) {
        console.error('사용자 정보 가져오기 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // 댓글 가져오기
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      const { comments, error } = await getComments(articleId);

      if (error) {
        setError(error);
      } else if (comments) {
        setComments(comments);

        // 전체 댓글 수 계산 (답글 포함)
        let total = 0;
        const countCommentsRecursively = (commentList: Comment[]) => {
          total += commentList.length;
          commentList.forEach(comment => {
            if (comment.replies && comment.replies.length > 0) {
              countCommentsRecursively(comment.replies);
            }
          });
        };

        countCommentsRecursively(comments);
        setTotalCommentCount(total);
      }

      setIsLoading(false);
    };

    fetchComments();
  }, [articleId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const { success, error } = await createComment({
        articleId,
        content: newComment,
        responseToId: replyTo?.id
      });

      if (error) {
        setError(error);
      } else if (success) {
        setNewComment('');
        setReplyTo(null);

        // 댓글 다시 가져오기
        const { comments: updatedComments } = await getComments(articleId);
        if (updatedComments) {
          setComments(updatedComments);

          // 전체 댓글 수 다시 계산
          let total = 0;
          const countCommentsRecursively = (commentList: Comment[]) => {
            total += commentList.length;
            commentList.forEach(comment => {
              if (comment.replies && comment.replies.length > 0) {
                countCommentsRecursively(comment.replies);
              }
            });
          };

          countCommentsRecursively(updatedComments);
          setTotalCommentCount(total);
        }
      }
    } catch (err) {
      console.error('댓글 작성 오류:', err);
      setError('댓글을 작성하는 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyTo({
      id: comment.id,
      author: comment.user_profiles?.name || `사용자 ${comment.author_id.substring(0, 8)}`
    });
    // 댓글 입력 영역으로 스크롤
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const authorName = comment.user_profiles?.name || `사용자 ${comment.author_id.substring(0, 8)}`;
    const createdAt = formatDistanceToNow(new Date(comment.created_at), {
      addSuffix: true,
      locale: ko
    });

    return (
      <div key={comment.id} className={`${isReply ? 'ml-8 border-l-2 pl-4 border-gray-200 dark:border-gray-700' : 'border-b border-gray-200 dark:border-gray-700 pb-4 mb-4'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Link 
            href={`/users/${encodeURIComponent(authorName)}`}
            className="font-medium hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline"
          >
            {authorName}
          </Link>
          <span className="text-xs text-gray-500">{createdAt}</span>
        </div>
        <div className="prose-sm dark:prose-invert mb-2 whitespace-pre-wrap">
          {comment.content}
        </div>
        {!isReply && (
          <button
            onClick={() => handleReply(comment)}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            답글 달기
          </button>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="my-8">
      <h2 className="text-xl font-medium mb-4">댓글 ({totalCommentCount})</h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map(comment => renderComment(comment))}
        </div>
      ) : (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-md mb-6">
          <p className="text-gray-500 text-center">아직 댓글이 없습니다. 첫 댓글을 작성해보세요.</p>
        </div>
      )}

      <div id="comment-form" className="mt-6">
        {user ? (
          <form onSubmit={handleSubmitComment}>
            {replyTo && (
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-t-md">
                <span className="text-sm">
                  <span className="text-emerald-600 dark:text-emerald-400">{replyTo.author}</span>님에게 답글 작성 중
                </span>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  취소
                </button>
              </div>
            )}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성해주세요..."
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              rows={4}
              disabled={isSubmitting}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '저장 중...' : '댓글 작성'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
            <p className="text-gray-500">댓글을 작성하려면 로그인이 필요합니다.</p>
            <a
              href="/login"
              className="mt-2 inline-block px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              로그인하기
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
