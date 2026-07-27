import os
import random
import logging
from datetime import datetime
from typing import Dict

from flask import Flask, render_template, request, session, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix

# logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or os.urandom(24)
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() in [
        'true', '1', 't']
    CORS_ORIGINS = os.environ.get(
        'CORS_ORIGINS', ['http://localhost:5173', 'http://127.0.0.1:5173', '*'])

    CHAT_ROOMS = {
        'room1': {
            'name': 'Room 1',
            'description': 'This is Room 1',
            'max_users': 10,
            'users': []
        },
        'room2': {
            'name': 'Room 2',
            'description': 'This is Room 2',
            'max_users': 5,
            'users': []
        }
    }


app = Flask(__name__)
app.config.from_object(Config)

CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173'],
     supports_credentials=True)

# Handle reverse proxy setups (e.g., when deploying behind Nginx)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1,
                        x_host=1, x_port=1, x_prefix=1)

# Setup the socketio server
socketio = SocketIO(app, cors_allowed_origins=Config.CORS_ORIGINS,
                    logger=True, engineio_logger=True)

# Make a database / Dict
active_users: Dict[str, Dict] = {}  # {sid: {'username': str, 'room': str}}

# Make a user


def generate_guest_username() -> str:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return f"Guest{random.randint(1000, 9999)}_{timestamp}"

# Home route


@app.route('/')
def index():
    if 'username' not in session:
        session['username'] = generate_guest_username()
        logger.info(f"Generated new guest username: {session['username']}")
    return render_template('index.html', username=session['username'], rooms=Config.CHAT_ROOMS)


@app.route('/api/me')
def api_me():
    if 'username' not in session:
        session['username'] = generate_guest_username()
        logger.info(
            f"Generated new guest username via API: {session['username']}")
    return jsonify({'username': session['username'], 'rooms': list(Config.CHAT_ROOMS.keys())})


# Make a connection
@socketio.event
def connect():
    try:
        if 'username' not in session:
            session['username'] = generate_guest_username()

            active_users[request.sid] = {
                'username': session['username'],
                'connected_at': datetime.now().isoformat()
            }

            emit('user_connected', {
                 'username': session['username']}, broadcast=True)
            logger.info(
                f"Generated new guest username on connect: {session['username']}")

    except Exception as e:
        logger.error(f"Error during connect: {e}")
        emit('error', {'message': 'An error occurred during connection.'})


@socketio.event
def disconnect():
    try:
        if request.sid in active_users:
            username = active_users[request.sid]['username']
            del active_users[request.sid]
            emit('user_disconnected', {'username': username}, broadcast=True)
            logger.info(f"User disconnected: {username}")
    except Exception as e:
        logger.error(f"Error during disconnect: {e}")
        emit('error', {'message': 'An error occurred during disconnection.'})


@socketio.on('join_room')
def on_join(data: dict):
    try:
        username = session.get('username')
        room = data.get('room')
        if room not in Config.CHAT_ROOMS:
            emit('error', {'message': 'Room does not exist.'})
            return

        join_room(room)
        Config.CHAT_ROOMS[room]['users'].append(username)
        emit('user_joined', {'username': username, 'room': room}, room=room)
        logger.info(f"{username} joined room: {room}")
    except Exception as e:
        logger.error(f"Error during join_room: {e}")
        emit('error', {'message': 'An error occurred while joining the room.'})


@socketio.on('leave_room')
def on_leave(data: dict):
    try:
        username = session.get('username')
        room = data.get('room')

        leave_room(room)
        if request.sid in active_users:
            active_users[request.sid]['room'] = None

        emit('user_left', {'username': username, 'room': room}, room=room)
        logger.info(f"{username} left room: {room}")
    except Exception as e:
        logger.error(f"Error during leave_room: {e}")
        emit('error', {'message': 'An error occurred while leaving the room.'})


@socketio.event
def handle_message(data: dict):
    try:
        username = session.get('username')
        room = data.get('room')
        message = data.get('message')

        if not room or not message:
            emit('error', {'message': 'Room and message are required.'})
            return
        if message == 'private':
            target_user = data.get('target_user')
            if not target_user:
                emit(
                    'error', {'message': 'Target user is required for private messages.'})
                return
            for sid, user_info in active_users.items():
                if user_info['username'] == target_user:
                    emit('private_message', {
                         'username': username, 'message': message, 'to': target_user}, room=sid)
                    logger.info(
                        f"Private message from {username} to {target_user}: {message}")
                    return
            emit('error', {'message': 'Target user not found.'})
        else:
            if room not in Config.CHAT_ROOMS:
                emit('error', {'message': 'Room does not exist.'})
                return
            emit('message', {'username': username,
                 'message': message}, room=room)
            logger.info(f"Message from {username} in room {room}: {message}")
    except Exception as e:
        logger.error(f"Error during handle_message: {e}")
        emit(
            'error', {'message': 'An error occurred while sending the message.'})


if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port,
                 debug=app.config['DEBUG'], use_reloader=app.config['DEBUG'])
