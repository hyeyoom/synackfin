'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import MarkdownEditor from '@/components/editor/MarkdownEditor';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {updateArticle} from '@/lib/actions/article-actions';
import {createSupabaseClientForBrowser} from '@/lib/utils/supabase/client';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

type BoardType = 'articles' | 'community';

interface EditPageProps {
    params: {
        id: string;
    };
}

export default function EditPage({ params }: EditPageProps) {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [content, setContent] = useState('');
    const [boardType, setBoardType] = useState<BoardType>('articles');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const articleId = parseInt(params.id);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const supabase = createSupabaseClientForBrowser();

                // 현재 로그인한 사용자 정보 가져오기
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push('/auth/login');
                    return;
                }

                // 기존 글 정보 가져오기
                const { data: article, error } = await supabase
                    .from('user_articles')
                    .select('*')
                    .eq('id', articleId)
                    .single();

                if (error || !article) {
                    setError('글을 찾을 수 없습니다.');
                    return;
                }

                // 글 작성자 확인
                if (article.author_id !== user.id) {
                    setError('글 수정 권한이 없습니다.');
                    return;
                }

                // 가져온 데이터로 상태 초기화
                setTitle(article.title || '');
                setUrl(article.url || '');
                setContent(article.content || '');
                setBoardType((article.board_type as BoardType) || 'articles');
            } catch (err) {
                console.error('글 정보 불러오기 오류:', err);
                setError('글 정보를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticle();
    }, [articleId, router]);

    const handleSave = async (updatedContent: string) => {
        if (!title.trim()) {
            setError('제목을 입력해주세요.');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            // 서버 액션을 사용하여 글 수정
            const result = await updateArticle({
                id: articleId,
                title,
                url: url || null,
                content: updatedContent,
                boardType
            });

            if (result.error) {
                throw new Error(result.error);
            }

            // 수정 성공하면 상세 페이지로 리다이렉트
            router.push(`/articles/${articleId}`);
            router.refresh(); // 데이터 갱신을 위해 페이지 새로고침
        } catch (err: unknown) {
            console.error('글 수정 오류:', err);
            setError(err instanceof Error ? err.message : '글을 수정하는 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                </div>
            </div>
        );
    }

    if (error && error.includes('권한이 없습니다')) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">글 수정</h1>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md mb-4">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="board-type">게시판 선택</Label>
                    <Select
                        value={boardType}
                        onValueChange={(value) => setBoardType(value as BoardType)}
                    >
                        <SelectTrigger id="board-type" className="w-full">
                            <SelectValue placeholder="게시판을 선택하세요"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="articles" className="cursor-pointer">기술 아티클</SelectItem>
                            <SelectItem value="community" className="cursor-pointer">커뮤니티</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="title">제목</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="글 제목을 입력하세요"
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="url">URL (선택사항)</Label>
                    <Input
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="관련 URL을 입력하세요 (선택사항)"
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <Label>내용</Label>
                    <MarkdownEditor
                        onSave={handleSave}
                        isSubmitting={isSubmitting}
                        initialValue={content}
                    />
                </div>
            </div>
        </div>
    );
}
