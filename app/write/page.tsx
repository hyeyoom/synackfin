'use client';

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import MarkdownEditor from '@/components/editor/MarkdownEditor';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {createArticle} from '@/lib/actions/article-actions';
import {checkUserProfile} from '@/lib/actions/profile-actions';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

type BoardType = 'articles' | 'community' | 'jobs';

export default function WritePage() {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [boardType, setBoardType] = useState<BoardType>('articles');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkProfile = async () => {
            try {
                const result = await checkUserProfile();
                
                if (result.error) {
                    setError(result.error);
                    return;
                }
                
                // 프로필이 없으면 프로필 페이지로 리다이렉트
                if (!result.hasProfile) {
                    router.push('/profile?reason=write&redirect=/write');
                    return;
                }
            } catch (err) {
                console.error('프로필 확인 오류:', err);
                setError('프로필 정보를 확인하는 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };
        
        checkProfile();
    }, [router]);

    const handleSave = async (content: string) => {
        if (!title.trim()) {
            setError('제목을 입력해주세요.');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            // 서버 액션을 사용하여 글 저장
            const result = await createArticle({
                title,
                url: url || null,
                content,
                boardType
            });

            if (result.error) {
                throw new Error(result.error);
            }

            // 성공 메시지 표시 후 홈으로 리다이렉트
            router.push('/');
            router.refresh(); // 데이터 갱신을 위해 페이지 새로고침
        } catch (err: unknown) {
            console.error('글 저장 오류:', err);
            setError(err instanceof Error ? err.message : '글을 저장하는 중 오류가 발생했습니다.');
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

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">새 글 작성</h1>

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
                            <SelectItem value="jobs" className="cursor-pointer">구인/구직</SelectItem>
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
                    <MarkdownEditor onSave={handleSave} isSubmitting={isSubmitting}/>
                </div>
            </div>
        </div>
    );
}
