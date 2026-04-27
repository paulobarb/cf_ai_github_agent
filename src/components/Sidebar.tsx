export default function Sidebar() {
  return (
    <aside
      style={{
        width: "300px",
        flexShrink: 0,
        padding: "20px",
        backgroundColor: "#252526",
        borderRadius: "8px",
        border: "1px solid #3e3e42",
        color: "#d4d4d4"
      }}
    >
      <h3 style={{ marginTop: "0", color: "#ff6600" }}>Quick Guide</h3>

      <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#aaaaaa" }}>
        <p style={{ marginBottom: "8px" }}>
          <strong style={{ color: "#d4d4d4" }}>How to use:</strong>
        </p>
        <ol style={{ paddingLeft: "20px", margin: "0 0 15px 0" }}>
          <li>Enter a GitHub PR URL</li>
          <li>AI analyzes the code diff</li>
          <li>Get OWASP vulnerability report</li>
          <li>Receive WAF rules for Cloudflare</li>
        </ol>

        <p style={{ marginTop: "15px", marginBottom: "8px" }}>
          <strong style={{ color: "#d4d4d4" }}>Analyzes:</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: "0", listStyleType: "none" }}>
          <li style={{ marginBottom: "4px" }}>
            🔴 Broken Access Control (IDOR)
          </li>
          <li style={{ marginBottom: "4px" }}>🔴 Cryptographic Failures</li>
          <li style={{ marginBottom: "4px" }}>🔴 Injection (SQL, XSS, OS)</li>
          <li style={{ marginBottom: "4px" }}>🔴 Insecure Design</li>
          <li style={{ marginBottom: "4px" }}>🔴 Security Misconfiguration</li>
          <li style={{ marginBottom: "4px" }}>
            🔴 Vulnerable and Outdated Components
          </li>
          <li style={{ marginBottom: "4px" }}>
            🔴 Identification and Authentication Failures
          </li>
          <li style={{ marginBottom: "4px" }}>
            🔴 Software and Data Integrity Failures
          </li>
          <li style={{ marginBottom: "4px" }}>
            🔴 Security Logging and Monitoring Failures
          </li>
          <li style={{ marginBottom: "4px" }}>
            🔴 Server-Side Request Forgery (SSRF)
          </li>
        </ul>
      </div>
    </aside>
  );
}
