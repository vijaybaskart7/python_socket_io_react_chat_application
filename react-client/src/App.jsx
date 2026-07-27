import { useSocket } from "./hooks/useSocket";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import MessageInput from "./components/MessageInput";
import "./App.css";

function App() {
  const {
    connected, username, activeUsers, messages,
    currentRoom, notifications, joinRoom, leaveRoom, sendMessage,
  } = useSocket();

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-logo">
          <span className="logo-icon">&#9889;</span>
          <span className="logo-text">SocketChat</span>
        </div>
        <div className="topbar-user">
          {username && (
            <>
              <span className="user-avatar-sm">{username[0]?.toUpperCase()}</span>
              <span className="topbar-username">{username}</span>
            </>
          )}
          <span className={`conn-badge ${connected ? "online" : "offline"}`}>
            {connected ? "Live" : "Offline"}
          </span>
        </div>
      </header>

      <div className="main-layout">
        <Sidebar currentRoom={currentRoom} activeUsers={activeUsers}
          onJoin={joinRoom} onLeave={leaveRoom} connected={connected} />
        <div className="chat-column">
          <ChatArea messages={messages} currentRoom={currentRoom} username={username} />
          <MessageInput onSend={sendMessage} disabled={!currentRoom || !connected} />
        </div>
      </div>

      <div className="notifications">
        {notifications.map(n => (
          <div key={n.id} className={`toast toast-${n.type}`}>{n.text}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
