'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MarkdownEditorProps {
  initialValue?: string;
  onSave: (content: string) => void;
  isSubmitting?: boolean;
}

export default function MarkdownEditor({ 
  initialValue = '', 
  onSave,
  isSubmitting = false
}: MarkdownEditorProps) {
  const [content, setContent] = useState(initialValue);
  const [activeTab, setActiveTab] = useState<string>('write');

  const handleSave = () => {
    onSave(content);
  };

  return (
    <div className="w-full border rounded-md">
      <Tabs defaultValue="write" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between border-b px-4 py-2">
          <TabsList className="grid w-[200px] grid-cols-2 bg-muted">
            <TabsTrigger 
              value="write"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-950/30 dark:data-[state=active]:text-emerald-400"
            >
              작성
            </TabsTrigger>
            <TabsTrigger 
              value="preview"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-950/30 dark:data-[state=active]:text-emerald-400"
            >
              미리보기
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button 
              onClick={handleSave}
              disabled={isSubmitting}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </div>
        
        <TabsContent value="write" className="p-0 m-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[500px] p-4 resize-none focus:outline-none bg-background"
            placeholder="마크다운으로 내용을 작성하세요..."
          />
        </TabsContent>
        
        <TabsContent value="preview" className="p-0 m-0">
          <div className="prose dark:prose-invert max-w-none p-4 min-h-[500px]">
            {content ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">내용을 입력하면 미리보기가 표시됩니다.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 