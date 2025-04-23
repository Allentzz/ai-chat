import { FC } from 'react';
import { ChatSession } from "../types";

interface SidebarProps {
    chats: ChatSession[];
    currentChatId: string | null;
    onNewChat: () => void;
    onSelectChat: (chatId: string) => void;
    onDeleteChat: (chatId: string) => void;  // 新增删除聊天的回调函数
}

export const Sidebar: FC<SidebarProps> = ({
    chats,
    currentChatId,
    onNewChat,
    onSelectChat,
    onDeleteChat,
}) => {
    return (
        <div className="sidebar">
        <button onClick={onNewChat} className="new-chat-button">
            + 新建对话
        </button>
        <div className="chat-list">
            {chats.map((chat) => (
            <div
                key={chat.id}
                className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
            >
                <span onClick={() => onSelectChat(chat.id)}>{chat.title}</span>
                <button 
                className="delete-chat-button"
                onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                }}
                >
                ×
                </button>
            </div>
            ))}
        </div>
        </div>
    );
};