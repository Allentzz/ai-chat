import { FC, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  index: number;
  onHeightChange: (index: number, height: number) => void;
}

export const MessageItem: FC<MessageItemProps> = ({
  message,
  index,
  onHeightChange,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);

  // 使用 useEffect 在组件渲染后测量高度并通知父组件
  useEffect(() => {
    if (itemRef.current) {
      const height = itemRef.current.offsetHeight;
      onHeightChange(index, height);
    }
  }, [message.text, index, onHeightChange]); // 当消息文本或索引变化时重新测量

  return (
    <div
      ref={itemRef}
      className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
      // 注意：这里不设置固定高度，让内容自然撑开
    >
      <div className="message-bubble">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match;
              return isInline ? (
                <code className={className} {...props}>
                  {children}
                </code>
              ) : (
                <pre className={className}>
                  <code className={match ? `language-${match[1]}` : ''} {...props}>
                    {String(children).replace(/\n$/, '')}
                  </code>
                </pre>
              );
            },
          }}
        >
          {message.text}
        </ReactMarkdown>
      </div>
    </div>
  );
};