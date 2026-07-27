import { useState } from 'react';

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input-area">
      <input
        className="message-input"
        type="text"
        placeholder={disabled ? 'Join a room to chat…' : 'Type a message… (Enter to send)'}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
        maxLength={500}
      />
      <button
        className="send-btn"
        onClick={handleSend}
        disabled={disabled || !text.trim()}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}
