import { useState, useRef, useMemo, useCallback } from "react";

// 定义列表项的接口
interface Item {
  id: number;
  content: string;
}

// 定义虚拟列表组件的 props 接口
interface VirtualListProps {
  data: Item[]; // 列表数据
  itemHeight?: number; // 默认的单个列表项高度，用于预估和计算
}

// List 组件作为示例页面，展示如何使用 VirtualList
export default function List() {
  // 使用 useMemo 创建一个大型模拟数据数组，包含100,000个项目
  // 每个项目的内容长度随机，以模拟可变高度的列表项
  const mockData = useMemo<Item[]>(() => {
    return Array.from({ length: 100000 }, (_, i) => {
      const randomRepeat = Math.floor(Math.random() * 20) + 1; // 1~20个重复
      return {
        id: i,
        content:
          `Item ${i} - `.padEnd(randomRepeat * 10, "🌟") + // 随机长度的内容
          "欢迎学习虚拟列表 🚀",
      };
    });
  }, []);

  return (
    <div className="h-screen">
      {/* 渲染 VirtualList 组件，传入模拟数据 */}
      <VirtualList data={mockData} />
    </div>
  );
}

// VirtualList 组件：实现可变高度的虚拟列表
function VirtualList({ data, itemHeight = 50 }: VirtualListProps) {
  const containerRef = useRef<HTMLDivElement>(null); // 滚动容器的引用
  const [scrollTop, setScrollTop] = useState<number>(0); // 滚动容器的当前滚动位置
  const containerHeight = 500; // 容器的固定高度
  const buffer = 3; // 缓冲区大小，在可视区域上下各渲染额外数量的项，防止快速滚动时出现空白

  // itemHeights 存储每个列表项的实际高度，key 为索引，value 为高度
  const [itemHeights, setItemHeights] = useState<Record<number, number>>({});

  // useCallback 优化 updateHeight 函数，用于更新单个列表项的实际高度
  const updateHeight = useCallback((index: number, height: number) => {
    setItemHeights((prev) => {
      if (prev[index] === height) return prev; // 如果高度未改变，则不更新状态
      return { ...prev, [index]: height }; // 更新指定索引项的高度
    });
  }, []);

  // useMemo 计算虚拟列表的关键参数：startIndex, endIndex, totalHeight
  // 只有当 scrollTop, itemHeights, data.length, itemHeight 变化时才重新计算
  const [startIndex, endIndex, totalHeight] = useMemo<
    [number, number, number]
  >(() => {
    let total = 0; // 累计高度
    let start = 0; // 可视区域的起始索引
    let end = data.length; // 可视区域的结束索引

    // 找出可视区域的起始索引 (start)
    for (let i = 0; i < data.length; i++) {
      const h = itemHeights[i] || itemHeight; // 获取当前项的实际高度，如果没有则使用默认高度
      if (total + h >= scrollTop) { // 如果当前项加上累计高度超过滚动位置，则找到起始项
        start = Math.max(0, i - buffer); // 考虑缓冲区，确保起始索引不小于0
        break;
      }
      total += h; // 累计高度
    }

    // 继续找出可视区域的结束索引 (end)
    let visibleHeight = 0; // 可视区域内已渲染项的累计高度
    for (let i = start; i < data.length; i++) {
      visibleHeight += itemHeights[i] || itemHeight; // 累计可视区域内项的高度
      if (visibleHeight >= containerHeight) { // 如果累计高度超过容器高度，则找到结束项
        end = Math.min(data.length, i + buffer * 2); // 考虑缓冲区，确保结束索引不超过数据长度
        break;
      }
    }

    // 计算所有项的总高度，用于设置滚动容器的实际高度
    const allHeight = data.reduce((acc, _, index) => {
      return acc + (itemHeights[index] || itemHeight);
    }, 0);

    return [start, end, allHeight]; // 返回计算出的起始索引、结束索引和总高度
  }, [scrollTop, itemHeights, data.length, itemHeight]);

  // useMemo 计算偏移量 (offsetTop)，即在可视区域上方未渲染项的总高度
  const offsetTop = useMemo<number>(() => {
    let offset = 0;
    for (let i = 0; i < startIndex; i++) {
      offset += itemHeights[i] || itemHeight;
    }
    return offset;
  }, [itemHeights, startIndex, itemHeight]);

  return (
    <div
      ref={containerRef} // 绑定滚动容器的引用
      className="overflow-y-auto bg-gray-50" // 允许垂直滚动，设置背景色
      style={{ height: `${containerHeight}px` }} // 设置容器固定高度
      onScroll={(e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop); // 更新滚动位置状态
      }}
    >
      {/* 内部的占位 div，其高度等于所有项的总高度，用于撑开滚动条 */}
      <div className="relative" style={{ height: `${totalHeight}px` }}>
        {/* 实际渲染内容的容器，通过 transform 属性进行垂直偏移，实现“窗口”效果 */}
        <div
          className="absolute w-full"
          style={{
            transform: `translateY(${offsetTop}px)`, // 根据偏移量移动内容
          }}
        >
          {/* 渲染可视区域内的列表项 */}
          {data.slice(startIndex, endIndex).map((item, i) => (
            <div
              key={item.id} // 使用 item.id 作为 key
              ref={(ref: HTMLDivElement | null) => {
                if (ref) {
                  const h = ref.offsetHeight; // 获取当前渲染项的实际高度
                  // 如果实际高度存在且与已记录的高度不同，则更新高度
                  if (h && itemHeights[startIndex + i] !== h) {
                    updateHeight(startIndex + i, h);
                  }
                }
              }}
              className="border-b p-4 text-center bg-white hover:bg-blue-50 transition-colors" // Tailwind CSS 样式
            >
              {item.content} {/* 显示列表项内容 */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}