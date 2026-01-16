import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Editor() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("Untitled Document");
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState("#667eea");
  const [wordCount, setWordCount] = useState(0);
  const [userCount, setUserCount] = useState(1);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    socket.on("receive_update", (data) => {
      setText(data.content);
      setSaving(false);
      setWordCount(data.content.trim().split(/\s+/).filter(Boolean).length);
    });

    socket.on("user_count", (data) => {
      setUserCount(data.count);
    });

    socket.on("show_typing", (data) => {
      setTyping(data.typing);
      setTimeout(() => setTyping(false), 1000);
    });

    return () => {
      socket.off("receive_update");
      socket.off("user_count");
      socket.off("show_typing");
    };
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    setSaving(true);
    setWordCount(value.trim().split(/\s+/).filter(Boolean).length);

    socket.emit("text_update", { content: value });
    socket.emit("typing", { typing: true });
  };

  const exportTxt = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "document"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        ...styles.page,
        background: `linear-gradient(135deg, ${theme}, #764ba2)`,
      }}
    >
      <div
        style={{
          ...styles.card,
          backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
          color: darkMode ? "#ffffff" : "#000000",
        }}
      >
        {/* Header */}
        <div style={styles.header}>
          <input
            style={{
              ...styles.titleInput,
              backgroundColor: darkMode ? "#2c2c2c" : "#f1f3f5",
              color: darkMode ? "#fff" : "#000",
            }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <span style={styles.status}>{saving ? "Saving..." : "Saved ✓"}</span>
        </div>

        {/* Info Bar */}
        <div style={styles.infoBar}>
          <span>👥 Users online: {userCount}</span>
          <span>🧮 Words: {wordCount}</span>
          <span>{typing && "✍️ Someone is typing..."}</span>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <button style={styles.button} onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>

          <select
            style={styles.select}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="#667eea">Purple</option>
            <option value="#11998e">Green</option>
            <option value="#ee0979">Pink</option>
            <option value="#f7971e">Orange</option>
            <option value="#2193b0">Blue</option>
          </select>

          <button style={styles.exportBtn} onClick={exportTxt}>
            ⬇ Export TXT
          </button>
        </div>

        {/* Editor */}
        <textarea
          style={{
            ...styles.textarea,
            backgroundColor: darkMode ? "#2c2c2c" : "#ffffff",
            color: darkMode ? "#ffffff" : "#000000",
          }}
          placeholder="Start typing here..."
          value={text}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "900px",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleInput: {
    fontSize: "20px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    padding: "6px 10px",
    width: "65%",
    outline: "none",
  },
  status: {
    fontSize: "14px",
    color: "green",
    fontWeight: "500",
  },
  infoBar: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    margin: "10px 0",
  },
  controls: {
    display: "flex",
    gap: "12px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  button: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4f46e5",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "500",
  },
  select: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  exportBtn: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#198754",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "500",
  },
  textarea: {
    width: "100%",
    height: "350px",
    padding: "15px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    resize: "none",
  },
};

export default Editor;
