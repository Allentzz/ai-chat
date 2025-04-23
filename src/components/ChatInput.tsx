import { FC, ChangeEvent, KeyboardEvent } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export const ChatInput: FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyDown,
}) => {
  return (
    <div className="input-area">
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="输入消息..."
      />
      <button onClick={onSend}>发送</button>
    </div>
  );
};