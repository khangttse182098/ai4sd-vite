import { useEffect, useRef, useState } from "react";
import "./App.css";

const App = () => {
  const [theme, setTheme] = useState("light");
  const [prompt, setPrompt] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("ai-chat-theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("ai-chat-theme", newTheme);
    setTheme(newTheme);
  };

  const handleKeyPress = (event: any) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleFetchModel();
    }
  };

  const handleFetchModel = async () => {
    console.log("hello");

    if (prompt.trim()) {
      console.log("AI Prompt:", prompt.trim());
      prompt.concat(
        ". Please don't include the thinking part, Return the project structure as a tree.Then provide the full content of each file using triple backticks with filename specified"
      );
      setPrompt("");

      const payload = {
        model: "v0-1.5-md",
        messages: [{ role: "user", content: prompt }],
      };
      const res = await fetch("https://api.v0.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer v1:jQ81CuUA83TCudKamMz6EB8d:NB19VNG0y3GPQbt3rua2lv5a`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to generate information");
      }

      const data = await res.json();

      const content = data.choices[0].message.content;

      const fileRes = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const file = await fileRes.blob();
      const url = URL.createObjectURL(file);
      setDownloadUrl(url);
    }
  };

  const handleDownloadFile = async () => {
    const a = document.createElement("a");
    a.href = downloadUrl!;
    a.download = "v0-project.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl!);
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">AI Assistant</div>
        <button
          className="theme-toggle"
          onClick={() => toggleTheme()}
          title="Toggle theme"
        >
          {theme === "dark" ? (
            <svg
              className="moon-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg
              className="sun-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="5"></circle>
              <path d="m12 1 0 2m0 18 0 2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12l2 0m18 0 2 0M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
            </svg>
          )}
        </button>
      </header>

      <main className="main-content">
        <div className="chat-container">
          <div className="chat-header">
            <h1 className="chat-title">What can I help you with?</h1>
            <p className="chat-subtitle">
              Ask me anything and I'll do my best to assist you
            </p>
          </div>

          <div className="input-section">
            <div className="input-wrapper">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e)}
                placeholder="Type your message here..."
                className="prompt-textarea"
                rows={3}
              ></textarea>
              <button
                className="send-btn"
                onClick={() => handleFetchModel()}
                disabled={!prompt.trim()}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
      {downloadUrl && (
        <button className="download-btn" onClick={() => handleDownloadFile()}>
          ⬇️ Download File
        </button>
      )}

      <footer className="footer">AI4SD • Made with ❤️</footer>
    </div>
  );
};

export default App;
