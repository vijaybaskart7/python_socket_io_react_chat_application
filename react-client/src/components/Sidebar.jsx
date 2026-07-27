const ROOMS = {
  room1: { name: 'Room 1', description: 'General chat', icon: '💬' },
  room2: { name: 'Room 2', description: 'Casual talk', icon: '🎉' },
};

export default function Sidebar({ currentRoom, activeUsers, onJoin, onLeave, connected }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className={`status-dot ${connected ? 'online' : 'offline'}`} />
        <span className="status-label">{connected ? 'Connected' : 'Disconnected'}</span>
      </div>

      <section className="sidebar-section">
        <h3 className="section-title">Rooms</h3>
        {Object.entries(ROOMS).map(([id, room]) => (
          <button
            key={id}
            className={`room-btn ${currentRoom === id ? 'active' : ''}`}
            onClick={() => currentRoom === id ? onLeave() : onJoin(id)}
          >
            <span className="room-icon">{room.icon}</span>
            <div className="room-info">
              <span className="room-name">{room.name}</span>
              <span className="room-desc">{room.description}</span>
            </div>
            {currentRoom === id && <span className="badge">●</span>}
          </button>
        ))}
      </section>

      <section className="sidebar-section">
        <h3 className="section-title">Online Users ({activeUsers.length})</h3>
        <ul className="user-list">
          {activeUsers.length === 0
            ? <li className="no-users">No users online</li>
            : activeUsers.map(u => (
              <li key={u} className="user-item">
                <span className="user-avatar">{u[0]?.toUpperCase()}</span>
                <span className="user-name">{u}</span>
              </li>
            ))}
        </ul>
      </section>
    </aside>
  );
}
