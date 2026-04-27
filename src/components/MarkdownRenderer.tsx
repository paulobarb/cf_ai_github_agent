// src/components/MarkdownRenderer.tsx
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeProps {
  _node?: unknown;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        code({ _node, inline, className, children, ...props }: CodeProps) {
          // Regex to extract the language name from the CSS class (e.g., "language-sql")
          const match = /language-(\w+)/.exec(className || "");

          // If it's a multi-line code block and we found a language match...
          return !inline && match ? (
            <SyntaxHighlighter
              {...props}
              style={vscDarkPlus as Record<string, React.CSSProperties>}
              language={match[1]}
              PreTag="div"
              customStyle={{
                borderRadius: "6px",
                marginTop: "10px",
                marginBottom: "10px",
                fontSize: "13px"
              }}
            >
              {/* Ensure we remove trailing newlines to keep the code block tight */}
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            /**
             * Fallback: Inline Code
             * Used for small snippets within paragraphs. Styled to match the dark theme.
             */
            <code
              {...props}
              style={{
                backgroundColor: "#3c3c3c",
                padding: "2px 4px",
                borderRadius: "4px",
                color: "#ce9178"
              }}
            >
              {children}
            </code>
          );
        }
      }}
    >
      {/* The raw markdown string to be parsed */}
      {content}
    </ReactMarkdown>
  );
}
