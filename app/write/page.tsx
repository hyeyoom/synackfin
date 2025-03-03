'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownEditor from '@/components/editor/MarkdownEditor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSupabaseClientForBrowser } from '@/lib/utils/supabase/client';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

type BoardType = 'articles' | 'community' | 'jobs';

export default function WritePage() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [boardType, setBoardType] = useState<BoardType>('articles');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createSupabaseClientForBrowser();

  const handleSave = async (content: string) => {
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 현재 로그인한 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('로그인이 필요합니다.');
        return;
      }

      // 여기서는 아직 실제 저장 로직을 구현하지 않고 콘솔에 출력만 합니다
      console.log('저장할 데이터:', {
        title,
        url: url || null,
        content,
        author_id: user.id,
        board_type: boardType
      });

      // 성공 메시지 표시 후 홈으로 리다이렉트 (임시)
      alert('글이 저장되었습니다. (테스트용 메시지)');
      router.push('/');
    } catch (err: any) {
      console.error('글 저장 오류:', err);
      setError(err.message || '글을 저장하는 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <SelectValue placeholder="게시판을 선택하세요" />
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
          <MarkdownEditor onSave={handleSave} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  );
} 