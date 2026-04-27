import { useState, useEffect } from "react";
import { useAgent } from "agents/react";
import Sidebar from "./components/Sidebar";
import MarkdownRenderer from "./components/MarkdownRenderer";
import type { ChatMessage } from "./types";

export default function App() {
  // State for the text currenty in the input box
  const [input, setInput] = useState("");

  // State for the full conversation history (displayed in the chat window)
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Effect Hook: Apply global dark mode styles to the <body>
  useEffect(() => {
    document.body.style.backgroundColor = "#1e1e1e";
    document.body.style.margin = "0";
    document.body.style.color = "#d4d4d4";
  }, []);

  const agent = useAgent({
    agent: "ChatAgent",
    name: "security-analyzer", // Unique instance name for the agent

    // Triggered whenever the backend DO sends a JSON string via WebSocket
    onMessage: (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as {
          type: string;
          content: string;
        };

        // If it's a valid message type, update the chat UI state
        if (data.type === "message") {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.content }
          ]);
        }
      } catch (_e: unknown) {
        // Fallback for non-JSON or raw binary data
        console.log("Received raw or unparsable data:", event.data);
      }
    },
    onOpen: () => console.log("Successfully connected to AppSec Agent"),
    onClose: () => console.log("Connection to AppSec Agent lost")
  });

  /**
   * Submit Handler: Captures user input and transmits it over the WebSocket.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: Don't send empty strings or try to send if the agent isn't connected
    if (!input.trim() || !agent) return;

    // Optimistically update the UI with the user's message immediately
    setMessages((prev) => [...prev, { role: "user", content: input }]);

    // Send the payload to the Durable Object
    agent.send(
      JSON.stringify({
        type: "message",
        content: input
      })
    );

    // Clear the input field for the next query
    setInput("");
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
    >
      {/* --- App Header --- */}
      <header
        style={{
          padding: "20px 0",
          borderBottom: "2px solid #3e3e42",
          marginBottom: "20px"
        }}
      >
        <h1 style={{ margin: 0, color: "#ff6600", fontSize: "28px" }}>
          🔒 Cloudflare AppSec Agent
        </h1>
        <p style={{ margin: "8px 0 0 0", color: "#aaaaaa" }}>
          AI-powered security analysis for GitHub Pull Requests
        </p>
      </header>

      {/* --- Main Dashboard Area --- */}
      <main
        style={{
          flex: 1,
          display: "flex",
          gap: "20px",
          overflow: "hidden" // Prevents the sidebar from scrolling the whole page
        }}
      >
        {/* Chat Section */}
        <section
          style={{
            flex: 1,
            minWidth: 0, // Critical flexbox fix to keep code blocks from expanding the width
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Scrollable Message Container */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              border: "1px solid #3e3e42",
              borderRadius: "8px",
              padding: "20px",
              backgroundColor: "#252526",
              marginBottom: "20px"
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  color: "#aaaaaa",
                  textAlign: "center",
                  padding: "40px 0"
                }}
              >
                <h3>Welcome to AppSec Agent</h3>
                <p>
                  Enter a GitHub PR URL to analyze (e.g.,
                  https://github.com/owner/repo/pull/123)
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                // Determine if this is a loading/status indicator or a full report
                const isStatusMessage =
                  typeof msg.content === "string" &&
                  (msg.content.startsWith("⏳") ||
                    msg.content.startsWith("🔗"));

                return (
                  <div
                    key={idx}
                    style={{
                      marginBottom: "15px",
                      padding: "15px",
                      backgroundColor:
                        msg.role === "user" ? "#2d2d2d" : "#1e1e1e",
                      borderRadius: "8px",
                      borderLeft: `4px solid ${msg.role === "user" ? "#007acc" : "#ff6600"}`
                    }}
                  >
                    <strong
                      style={{
                        color: msg.role === "user" ? "#569cd6" : "#ff6600"
                      }}
                    >
                      {msg.role === "user" ? "You" : "AI Security Agent"}:
                    </strong>

                    <div
                      style={{
                        marginTop: "8px",
                        fontStyle: isStatusMessage ? "italic" : "normal",
                        color: isStatusMessage ? "#858585" : "inherit",
                        whiteSpace: "pre-wrap"
                      }}
                    >
                      {typeof msg.content === "string" ? (
                        isStatusMessage ? (
                          msg.content
                        ) : (
                          /* Render full reports using the Syntax Highlighter component */
                          <MarkdownRenderer content={msg.content} />
                        )
                      ) : (
                        /* Fallback for JSON-structured logs */
                        <pre
                          style={{
                            margin: 0,
                            overflow: "auto",
                            background: "#3c3c3c",
                            padding: "12px",
                            borderRadius: "4px"
                          }}
                        >
                          {JSON.stringify(msg.content, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: "10px" }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter GitHub PR URL or ask a security question..."
              style={{
                flex: 1,
                padding: "12px 16px",
                border: "2px solid #3e3e42",
                borderRadius: "6px",
                fontSize: "16px",
                outline: "none",
                backgroundColor: "#3e3e42",
                color: "#d4d4d4"
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || !agent}
              style={{
                padding: "12px 24px",
                backgroundColor: "#ff6600",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: agent ? "pointer" : "not-allowed",
                opacity: agent ? 1 : 0.6
              }}
            >
              Analyze
            </button>
          </form>
        </section>

        {/* Sidebar Component: Extracted for better separation of concerns */}
        <Sidebar />
      </main>
    </div>
  );
}
