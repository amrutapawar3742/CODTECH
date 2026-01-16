from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)
CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*")

client = MongoClient("mongodb://localhost:27017/")
db = client["collaborative_editor"]
documents = db["documents"]

CONNECTED_USERS = 0
DOCUMENT_ID = "shared_doc"


@socketio.on("connect")
def handle_connect():
    global CONNECTED_USERS
    CONNECTED_USERS += 1
    socketio.emit("user_count", {"count": CONNECTED_USERS})
    print("User connected:", CONNECTED_USERS)


@socketio.on("disconnect")
def handle_disconnect():
    global CONNECTED_USERS
    CONNECTED_USERS -= 1
    socketio.emit("user_count", {"count": CONNECTED_USERS})
    print("User disconnected:", CONNECTED_USERS)


@socketio.on("text_update")
def text_update(data):
    content = data["content"]

    documents.update_one(
        {"doc_id": DOCUMENT_ID},
        {"$set": {"content": content, "last_updated": datetime.utcnow()}},
        upsert=True
    )

    socketio.emit("receive_update", {"content": content})


@socketio.on("typing")
def typing(data):
    socketio.emit("show_typing", {"typing": data["typing"]})


if __name__ == "__main__":
    socketio.run(app, debug=True)
