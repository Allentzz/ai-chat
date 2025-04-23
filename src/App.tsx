import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { ChatSession, Message, ChatMessage } from './types';
import { chatCompletion } from './services/openai';
import './App.scss';

function App() {
  // 聊天会话列表状态
  const [chats, setChats] = useState<ChatSession[]>([]);
  // 当前选中的聊天会话 ID
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  // 当前聊天窗口的消息
  const [messages, setMessages] = useState<Message[]>([]);
  // 输入框内容
  const [newMessage, setNewMessage] = useState('');

  // 从 localStorage 加载聊天记录 (仅在组件首次加载时)
  useEffect(() => {
    const savedChats = localStorage.getItem('chatSessions');
    if (savedChats) {
      const parsedChats: ChatSession[] = JSON.parse(savedChats);
      setChats(parsedChats);
      // 默认选中第一个聊天
      if (parsedChats.length > 0) {
        setCurrentChatId(parsedChats[0].id);
        setMessages(parsedChats[0].messages);
      }
    }
  }, []);

  // 当 chats 状态变化时，保存到 localStorage
  useEffect(() => {
    if (chats.length > 0) { // 避免初始空数组覆盖已有存储
        localStorage.setItem('chatSessions', JSON.stringify(chats));
    }
    // 如果当前有选中的聊天，更新 messages 状态
    if (currentChatId) {
        const currentChat = chats.find(chat => chat.id === currentChatId);
        if (currentChat) {
            setMessages(currentChat.messages);
        } else {
            // 如果当前选中的 chat 被删除了，重置状态
            setCurrentChatId(null);
            setMessages([]);
        }
    } else if (chats.length > 0) {
        // 如果没有选中的，但有聊天记录，默认选中第一个
        setCurrentChatId(chats[0].id);
        setMessages(chats[0].messages);
    } else {
        // 没有聊天记录了
        setMessages([]);
    }
  }, [chats, currentChatId]); // 依赖 chats 和 currentChatId


  // 处理新建聊天
  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: ChatSession = {
      id: newChatId,
      title: `新对话 ${chats.length + 1}`,
      messages: [],
    };
    setChats([newChat, ...chats]); // 新对话放在最前面
    setCurrentChatId(newChatId);
    setMessages([]); // 新对话开始时消息列表为空
  };

  // 处理选择聊天
  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    // 不需要在这里设置 messages，useEffect 会处理
  };

  // 添加一个状态来存储正在生成的消息
  const [generatingMessage, setGeneratingMessage] = useState<Message | null>(null);

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChatId) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: newMessage,
      sender: 'user',
    };

    // 创建一个临时的 AI 消息用于流式显示
    const tempAiMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      text: '',
      sender: 'ai',
    };

    // 先添加用户消息
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      )
    );

    setGeneratingMessage(tempAiMessage);
    setNewMessage(''); // 清空输入框

    try {
      // 准备发送给 OpenAI 的消息历史
      const currentChat = chats.find(chat => chat.id === currentChatId);
      const messageHistory: ChatMessage[] = currentChat?.messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })) || [];

      // 添加当前用户消息
      messageHistory.push({
        role: 'user',
        content: newMessage
      });

      // 调用 OpenAI API 并处理流式响应
      const response = await chatCompletion(
        messageHistory,
        (text) => {
          // console.log('AI:', text);
          setGeneratingMessage(prev => {
            if (prev) {
              return { ...prev, text };
            }
            return null;
          });
        }
      );

      // 更新最终的聊天记录
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, { ...tempAiMessage, text: response.content }]
              }
            : chat
        )
      );
    } catch (error) {
      console.error('发送消息失败:', error);
      alert('发送消息失败，请重试');
    } finally {
      setGeneratingMessage(null);
    }
  };

  // 处理输入框变化
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  // 处理回车发送
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // 阻止默认的回车换行
      handleSendMessage();
    }
  };

  // 处理删除聊天
  const handleDeleteChat = (chatId: string) => {
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    // 如果删除的是当前选中的聊天，currentChatId 会通过 useEffect 自动更新
  };

  return (
    <div className="app-container">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />
      <div className="chat-window">
        {currentChatId ? (
          <>
            <MessageList 
              messages={[
                ...messages,
                ...(generatingMessage ? [generatingMessage] : [])
              ]} 
            />
            <ChatInput
              value={newMessage}
              onChange={handleInputChange}
              onSend={handleSendMessage}
              onKeyDown={handleKeyDown}
            />
          </>
        ) : (
          <div className="no-chat-selected">
            请新建或选择一个对话开始聊天
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
