# Python SocketIO React Chat Application

A real-time multi-room chat application built with a **Flask-SocketIO** backend and a **React** frontend.

---

## Tech Stack

### Backend

| Technology         | Purpose                                            |
| ------------------ | -------------------------------------------------- |
| **Python 3**       | Core language                                      |
| **Flask**          | Web framework & HTTP routing                       |
| **Flask-SocketIO** | WebSocket server (real-time events)                |
| **Flask-CORS**     | Cross-Origin Resource Sharing for React dev server |
| **Werkzeug**       | WSGI utilities / reverse proxy support             |

### Frontend

| Technology           | Purpose                                       |
| -------------------- | --------------------------------------------- |
| **React 18**         | UI library                                    |
| **Vite**             | Dev server & build tool                       |
| **socket.io-client** | WebSocket client (connects to Flask-SocketIO) |
| **CSS Variables**    | Dark-theme design system                      |

---

## Features

- **Multi-room chat** — Join / leave Room 1 and Room 2 independently
- **Guest usernames** — Server auto-generates a unique username per session
- **Real-time events** — Messages, joins, and leaves are pushed instantly via WebSocket
- **Private messages** — Send a direct message to any active user
- **Online users panel** — Live sidebar showing all connected users
- **Toast notifications** — Animated alerts for join/leave/error events
- **Dark UI** — Discord-inspired dark theme with message bubbles

---

## Project Structure

```
python_socketio/
├── main.py                  # Flask + SocketIO server
├── templates/
│   └── index.html           # Legacy Jinja2 template (Flask route)
├── react-client/            # React frontend (Vite)
│   ├── vite.config.js       # Vite config with /socket.io proxy
│   ├── package.json
│   └── src/
│       ├── App.jsx           # Root component + layout
│       ├── App.css           # Global dark-theme styles
│       ├── hooks/
│       │   └── useSocket.js  # Socket connection & state management
│       └── components/
│           ├── Sidebar.jsx   # Room list + online users
│           ├── ChatArea.jsx  # Message display
│           └── MessageInput.jsx  # Send bar
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm

### Backend Setup

```bash
# Install Python dependencies
pip install flask flask-socketio flask-cors werkzeug

# Run the server
python main.py
# Server starts on http://localhost:5000
```

### Frontend Setup

```bash
cd react-client

# Install Node dependencies
npm install

# Start the dev server
npm run dev
# App opens at http://localhost:5173
```

### Production Build

```bash
cd react-client
npm run build
# Outputs to react-client/dist/
```

---

## SocketIO Events

| Event               | Direction       | Description                       |
| ------------------- | --------------- | --------------------------------- |
| `connect`           | Client → Server | Establish connection              |
| `disconnect`        | Client → Server | Close connection                  |
| `join_room`         | Client → Server | Join a chat room                  |
| `leave_room`        | Client → Server | Leave a chat room                 |
| `handle_message`    | Client → Server | Send a message to a room          |
| `user_connected`    | Server → Client | Broadcast new connection          |
| `user_disconnected` | Server → Client | Broadcast disconnection           |
| `user_joined`       | Server → Room   | User joined a room                |
| `user_left`         | Server → Room   | User left a room                  |
| `message`           | Server → Room   | New chat message                  |
| `private_message`   | Server → Client | Direct message to a specific user |
| `error`             | Server → Client | Error notification                |

---

## API Endpoints

| Method | Path      | Description                                      |
| ------ | --------- | ------------------------------------------------ |
| `GET`  | `/`       | Serves the legacy Jinja2 HTML template           |
| `GET`  | `/api/me` | Returns the session username and available rooms |

---

## Environment Variables

| Variable       | Default      | Description              |
| -------------- | ------------ | ------------------------ |
| `SECRET_KEY`   | random bytes | Flask session secret key |
| `FLASK_DEBUG`  | `False`      | Enable debug/reload mode |
| `CORS_ORIGINS` | `*`          | Allowed CORS origins     |
| `PORT`         | `5000`       | Server port              |
