import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [messages, setMessages] = useState({});      // { roomId: [msg, ...] }
  const [currentRoom, setCurrentRoom] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((text, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  }, []);

  const addMessage = useCallback((room, msg) => {
    setMessages(prev => ({
      ...prev,
      [room]: [...(prev[room] || []), { ...msg, id: Date.now() + Math.random() }],
    }));
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'], withCredentials: true });
    socketRef.current = socket;

    // Fetch server-assigned username
    fetch(`${SOCKET_URL}/api/me`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setUsername(data.username))
      .catch(() => {});

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      addNotification('Disconnected from server', 'error');
    });

    socket.on('user_connected', ({ username: u }) => {
      setActiveUsers(prev => [...new Set([...prev, u])]);
      addNotification(`${u} joined`, 'info');
    });

    socket.on('user_disconnected', ({ username: u }) => {
      setActiveUsers(prev => prev.filter(x => x !== u));
      addNotification(`${u} left`, 'warning');
    });

    socket.on('user_joined', ({ username: u, room }) => {
      addMessage(room, { type: 'system', text: `${u} joined ${room}`, timestamp: new Date().toISOString() });
    });

    socket.on('user_left', ({ username: u, room }) => {
      addMessage(room, { type: 'system', text: `${u} left ${room}`, timestamp: new Date().toISOString() });
    });

    socket.on('message', ({ username: u, message }) => {
      // We need the current room context; store with a sentinel
      socketRef.current._lastRoom && addMessage(socketRef.current._lastRoom, {
        type: 'chat',
        username: u,
        text: message,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('private_message', ({ username: u, message, to }) => {
      addMessage('private', {
        type: 'private',
        username: u,
        text: message,
        to,
        timestamp: new Date().toISOString(),
      });
      addNotification(`Private message from ${u}`, 'private');
    });

    socket.on('error', ({ message: errMsg }) => {
      addNotification(errMsg, 'error');
    });

    return () => socket.disconnect();
  }, [addMessage, addNotification]);

  // Keep a ref to current room for the message handler
  useEffect(() => {
    if (socketRef.current) socketRef.current._lastRoom = currentRoom;
  }, [currentRoom]);

  const joinRoom = useCallback((room) => {
    if (!socketRef.current) return;
    if (currentRoom) {
      socketRef.current.emit('leave_room', { room: currentRoom });
    }
    socketRef.current.emit('join_room', { room });
    setCurrentRoom(room);
  }, [currentRoom]);

  const leaveRoom = useCallback(() => {
    if (!socketRef.current || !currentRoom) return;
    socketRef.current.emit('leave_room', { room: currentRoom });
    setCurrentRoom(null);
  }, [currentRoom]);

  const sendMessage = useCallback((message) => {
    if (!socketRef.current || !currentRoom) return;
    socketRef.current.emit('handle_message', { room: currentRoom, message });
    addMessage(currentRoom, {
      type: 'chat',
      username: 'You',
      text: message,
      timestamp: new Date().toISOString(),
      self: true,
    });
  }, [currentRoom, addMessage]);

  return {
    connected,
    username,
    setUsername,
    activeUsers,
    messages,
    currentRoom,
    notifications,
    joinRoom,
    leaveRoom,
    sendMessage,
  };
}
