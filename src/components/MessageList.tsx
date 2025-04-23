import { FC, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';

interface MessageListProps {
    messages: Message[];
}

export const MessageList: FC<MessageListProps> = ({ messages }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="messages-area">
        {messages.map((message) => (
            <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
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
                    }
                }}
            >
                {message.text}
            </ReactMarkdown>
            </div>
            </div>
        ))}
        <div ref={messagesEndRef} />
        </div>
    );
};