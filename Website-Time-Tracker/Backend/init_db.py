import sqlite3

conn = sqlite3.connect("database.db")
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS usage (
    id INTEGER PRIMARY KEY,
    user TEXT,
    site TEXT,
    time INTEGER,
    category TEXT,
    date TEXT
)
""")

conn.commit()
conn.close()

print("Database created successfully")
