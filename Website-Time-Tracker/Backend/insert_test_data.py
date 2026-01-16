import sqlite3
from datetime import date

USERNAME = "Amruta"   # <-- MUST match /session exactly

conn = sqlite3.connect("database.db")
cur = conn.cursor()

cur.execute("""
INSERT INTO usage (user, site, time, category, date)
VALUES (?, ?, ?, ?, ?)
""", (USERNAME, "github.com", 7200000, "Productive", date.today()))

cur.execute("""
INSERT INTO usage (user, site, time, category, date)
VALUES (?, ?, ?, ?, ?)
""", (USERNAME, "youtube.com", 3600000, "Unproductive", date.today()))

conn.commit()
conn.close()

print("Test usage data inserted")
