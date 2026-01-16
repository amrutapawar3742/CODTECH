from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room
from datetime import datetime


app = Flask(__name__)
app.config["SECRET_KEY"] = "secretkey"
socketio = SocketIO(app)


@app.route("/")
def index():
    return render_template("index.html")


@socketio.on("join")
def handle_join(data):
    join_room(data["room"])
    emit(
        "system_message",
        {
            "text": f'{data["username"]} joined the room',
            "time": datetime.now().strftime("%H:%M")
        },
        room=data["room"]
    )


@socketio.on("send_message")
def handle_message(data):
    emit(
        "chat_message",
        {
            "username": data["username"],
            "message": data["message"],
            "time": datetime.now().strftime("%H:%M")
        },
        room=data["room"]
    )


@socketio.on("leave")
def handle_leave(data):
    leave_room(data["room"])
    emit(
        "system_message",
        {
            "text": f'{data["username"]} left the room',
            "time": datetime.now().strftime("%H:%M")
        },
        room=data["room"]
    )


if __name__ == "__main__":
    socketio.run(app, debug=True)
