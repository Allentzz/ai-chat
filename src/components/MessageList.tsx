import { FC, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Message } from '../types';
import { MessageItem } from './MessageItem'; // 导入 MessageItem 组件

interface MessageListProps {
  messages: Message[];
}

// 预估的单个消息高度，用于初始计算，实际高度会在渲染后测量
const ESTIMATED_MESSAGE_HEIGHT = 100; 
// 缓冲区大小，在可视区域上下各渲染额外数量的项
const BUFFER_ITEMS = 5; 

export const MessageList: FC<MessageListProps> = ({ messages }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null); // 滚动容器的引用
  const [scrollTop, setScrollTop] = useState<number>(0); // 滚动容器的当前滚动位置
  // 使用 Map 存储每个消息项的实际高度，key 为消息 id，value 为高度
  const [itemHeights, setItemHeights] = useState<Map<string, number>>(new Map());

  // useCallback 优化 updateHeight 函数，用于更新单个列表项的实际高度
  const updateHeight = useCallback((id: string, height: number) => {
    setItemHeights(prev => {
      // 如果高度已存在且相同，则不更新状态
      if (prev.has(id) && prev.get(id) === height) {
        return prev;
      }
      const newHeights = new Map(prev);
      newHeights.set(id, height);
      return newHeights;
    });
  }, []);

  // useMemo 计算虚拟列表的关键参数：startIndex, endIndex, totalHeight
  // 只有当 scrollTop, itemHeights, messages 变化时才重新计算
  const [startIndex, endIndex, totalHeight] = useMemo(() => {
    let total = 0; // 累计高度
    let start = 0; // 可视区域的起始索引
    let end = messages.length; // 可视区域的结束索引

    // 找出可视区域的起始索引 (start)
    for (let i = 0; i < messages.length; i++) {
      const h = itemHeights.get(messages[i].id) || ESTIMATED_MESSAGE_HEIGHT; // 获取实际高度或使用预估高度
      if (total + h >= scrollTop) { // 如果当前项加上累计高度超过滚动位置，则找到起始项
        start = Math.max(0, i - BUFFER_ITEMS); // 考虑缓冲区
        break;
      }
      total += h; // 累计高度
    }

    // 继续找出可视区域的结束索引 (end)
    let visibleHeight = 0; // 可视区域内已渲染项的累计高度
    const containerHeight = scrollContainerRef.current?.clientHeight || 0; // 获取容器实际高度
    for (let i = start; i < messages.length; i++) {
      visibleHeight += itemHeights.get(messages[i].id) || ESTIMATED_MESSAGE_HEIGHT; // 累计可视区域内项的高度
      if (visibleHeight >= containerHeight) { // 如果累计高度超过容器高度，则找到结束项
        end = Math.min(messages.length, i + BUFFER_ITEMS); // 考虑缓冲区
        break;
      }
    }

    // 计算所有项的总高度
    const allHeight = messages.reduce((acc, message) => {
      return acc + (itemHeights.get(message.id) || ESTIMATED_MESSAGE_HEIGHT);
    }, 0);

    return [start, end, allHeight]; // 返回计算出的起始索引、结束索引和总高度
  }, [scrollTop, itemHeights, messages]);

  // useMemo 计算偏移量 (offsetTop)，即在可视区域上方未渲染项的总高度
  const offsetTop = useMemo<number>(() => {
    let offset = 0;
    for (let i = 0; i < startIndex; i++) {
      offset += itemHeights.get(messages[i].id) || ESTIMATED_MESSAGE_HEIGHT;
    }
    return offset;
  }, [itemHeights, startIndex, messages]);

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      setScrollTop(scrollContainerRef.current.scrollTop);
    }
  }, []);

  // 监听滚动事件
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     scrollContainerRef.current?.scrollTo({ 
  //       top: 9000,
  //       behavior: 'smooth'
  //     });
  //   }, 100);
  // }, []);

  // 自动滚动到底部逻辑
  // 使用 useRef 存储前一个消息数量，判断是否是新消息到来
  const prevMessagesLength = useRef(messages.length);
  useEffect(() => {
    // 如果消息数量增加，并且最后一条消息不是用户发送的（通常是AI回复）
    // 或者当消息总数较少，全部可见时
    const isNewMessage = messages.length > prevMessagesLength.current;
    const isAIMessage = messages.length > 0 && messages[messages.length - 1].sender !== 'user';
    const isFewMessages = messages.length <= (scrollContainerRef.current?.clientHeight || 0) / ESTIMATED_MESSAGE_HEIGHT; // 粗略判断是否消息很少，全部可见

    if (isNewMessage && (isAIMessage || isFewMessages)) {
       // 使用 setTimeout 确保在 DOM 更新和高度测量完成后再滚动
				setTimeout(() => {
					scrollContainerRef.current?.scrollTo({
						top: scrollContainerRef.current.scrollHeight,
						behavior: 'smooth',
					});
				}, 0);
    }

    prevMessagesLength.current = messages.length; // 更新前一个消息长度
  }, [messages]); // 依赖 messages 数组变化

  // 渲染可视区域内的消息项
  const visibleMessages = messages.slice(startIndex, endIndex);

  return (
    <div
      ref={scrollContainerRef} // 绑定滚动容器的引用
      className="messages-area" // 使用您的 CSS 类
      style={{ overflowY: 'auto', height: '100%' }} // 允许垂直滚动，设置高度
      // onScroll 事件已通过 addEventListener 绑定，这里可以移除
    >
      {/* 内部的占位 div，其高度等于所有项的总高度，用于撑开滚动条 */}
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        {/* 实际渲染内容的容器，通过 transform 属性进行垂直偏移 */}
        <div
          style={{
            transform: `translateY(${offsetTop}px)`, // 根据偏移量移动内容
            width: '100%', // 确保宽度正确
            position: 'absolute', // 绝对定位
            top: 0, // 定位在顶部
            left: 0, // 定位在左侧
          }}
        >
          {/* 渲染可视区域内的 MessageItem 组件 */}
          {visibleMessages.map((message, i) => (
            <MessageItem
              key={message.id} // 使用 message.id 作为 key
              message={message}
              index={startIndex + i} // 传递消息在原始数组中的索引
              onHeightChange={(index, height) => updateHeight(message.id, height)} // 通过闭包转换参数类型，将 index 转为 message.id
            />
          ))}
        </div>
      </div>
    </div>
  );
};