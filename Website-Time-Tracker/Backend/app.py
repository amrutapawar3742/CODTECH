from flask import Flask, request, jsonify, session
from flask_cors import CORS
import sqlite3
from datetime import datetime
from categories import classify_site

app = Flask(__name__)
app.secret_key = "supersecretkey"

# Enable CORS with credentials
CORS(app, supports_credentials=True)


def get_db():
    return sqlite3.connect("database.db")

# ---------- AUTH ----------


@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    db = get_db()
    cur = db.cursor()

    cur.execute(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        (data["username"], data["password"])
    )

    db.commit()
    db.close()
    return jsonify({"message": "Signup successful"})


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    db = get_db()
    cur = db.cursor()

    cur.execute(
        "SELECT * FROM users WHERE username=? AND password=?",
        (data["username"], data["password"])
    )

    user = cur.fetchone()
    db.close()

    if user:
        session["user"] = data["username"]
        return jsonify({"message": "Login successful"})

    return jsonify({"error": "Invalid credentials"}), 401


@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user", None)
    return jsonify({"message": "Logged out"})


@app.route("/session", methods=["GET"])
def check_session():
    if "user" in session:
        return jsonify({"logged_in": True, "user": session["user"]})
    return jsonify({"logged_in": False}), 401

# ---------- DATA ----------


@app.route("/save", methods=["POST"])
def save_usage():
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    category = classify_site(data["site"])

    db = get_db()
    cur = db.cursor()

    cur.execute(
        """INSERT INTO usage (user, site, time, category, date)
           VALUES (?, ?, ?, ?, ?)""",
        (
            session["user"],
            data["site"],
            data["time"],
            category,
            datetime.now().date()
        )
    )

    db.commit()
    db.close()
    return jsonify({"message": "Data saved"})


@app.route("/weekly", methods=["GET"])
def weekly_report():
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    db = get_db()
    cur = db.cursor()

    cur.execute("""
        SELECT category, SUM(time)
        FROM usage
        WHERE user = ?
          AND date >= date('now', '-7 days')
        GROUP BY category
    """, (session["user"],))

    result = cur.fetchall()
    db.close()
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)
