import { useEffect, useRef } from 'react';

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatArea({ messages, currentRoom, username }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentRoom) {
    return (
      <div className="chat-area empty-state">
        <div className="empty-icon">💬</div>
        <h2>Select a room to start chatting</h2>
        <p>Choose a room from the sidebar to join the conversation.</p>
      </div>
    );
  }

  const roomMessages = messages[currentRoom] || [];

  return (
    <div className="chat-area">
      <div className="chat-header">
        <span className="chat-room-name"># {currentRoom}</span>
      </div>
      <div className="messages-container">
        {roomMessages.length === 0 && (
          <div className="no-messages">No messages yet. Say hello! 👋</div>
        )}
        {roomMessages.map((msg) => {
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="system-message">
                <span>{msg.text}</span>
                <span className="msg-time">{formatTime(msg.timestamp)}</span>
              </div>
            );
          }
          if (msg.type === 'private') {
            return (
              <div key={msg.id} className={`message private ${msg.self ? 'self' : ''}`}>
                <span className="msg-avatar">{msg.username[0]?.toUpperCase()}</span>
                <div className="msg-body">
                  <div className="msg-meta">
                    <span className="msg-user private-label">🔒 {msg.username}</span>
                    <span className="msg-time">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="msg-text">{msg.text}</div>
                </div>
              </div>
            );
          }
          return (
            <div key={msg.id} className={`message ${msg.self ? 'self' : ''}`}>
              <span className="msg-avatar">{msg.username[0]?.toUpperCase()}</span>
              <div className="msg-body">
                <div className="msg-meta">
                  <span className="msg-user">{msg.username}</span>
                  <span className="msg-time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="msg-text">{msg.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
