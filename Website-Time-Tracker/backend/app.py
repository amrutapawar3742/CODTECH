from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3

app = Flask(__name__)
app.secret_key = "secret123"

# IMPORTANT: support credentials
CORS(app, supports_credentials=True)

DB_NAME = "database.db"


def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


# ---------------- CREATE TABLES ---------------- #
with get_db() as conn:
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            website TEXT,
            time_spent INTEGER,
            category TEXT,
            date TEXT
        )
    """)

# ---------------- AUTH ROUTES ---------------- #


@app.route("/")
def login_page():
    return render_template("login.html")


@app.route("/register")
def register_page():
    return render_template("register.html")


@app.route("/signup", methods=["POST"])
def signup():
    name = request.form["name"]
    email = request.form["email"]
    password = generate_password_hash(request.form["password"])

    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                (name, email, password)
            )
        return redirect(url_for("login_page"))
    except sqlite3.IntegrityError:
        return "User already exists"


@app.route("/login", methods=["POST"])
def login():
    email = request.form["email"]
    password = request.form["password"]

    with get_db() as conn:
        user = conn.execute(
            "SELECT * FROM users WHERE email=?",
            (email,)
        ).fetchone()

    if user and check_password_hash(user["password"], password):
        session["user_id"] = user["id"]
        return redirect(url_for("dashboard"))

    return "Invalid Credentials"


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login_page"))

# ---------------- TRACKING ---------------- #


@app.route("/track", methods=["POST"])
def track_time():
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json

    with get_db() as conn:
        conn.execute("""
            INSERT INTO activity (user_id, website, time_spent, category, date)
            VALUES (?, ?, ?, ?, date('now'))
        """, (
            session["user_id"],
            data["website"],
            data["time"],
            data["category"]
        ))

    return jsonify({"status": "saved"})


# ---------------- DASHBOARD ---------------- #

@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        return redirect(url_for("login_page"))
    return render_template("dashboard.html")


@app.route("/api/weekly-data")
def weekly_data():
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    with get_db() as conn:
        rows = conn.execute("""
            SELECT category, SUM(time_spent) as total
            FROM activity
            WHERE user_id = ?
              AND date >= date('now','-7 day')
            GROUP BY category
        """, (session["user_id"],)).fetchall()

    result = {"productive": 0, "unproductive": 0, "neutral": 0}
    for row in rows:
        result[row["category"]] = row["total"]

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
