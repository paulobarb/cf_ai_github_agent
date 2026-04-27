import { createWorkersAI } from "workers-ai-provider";
import { Agent, routeAgentRequest } from "agents";
import { generateText } from "ai";
import { AI_MODEL, SYSTEM_PROMPT } from "./config";
import type { Env, GitHubPRMetadata } from "./types";

type AIRequestOptions = Parameters<typeof generateText>[0];
type AIMessage = NonNullable<AIRequestOptions["messages"]>[number];

type SecurityAgentAIRequest = AIRequestOptions & {
  maxTokens?: number;
};

export class ChatAgent extends Agent<Env> {
  /**
   * WebSocket message handler.
   * Path: WebSocket -> SQLite -> GitHub -> AI -> WebSocket.
   */
  async onMessage(
    connection: { send: (s: string) => void },
    wsMessage: string
  ) {
    try {
      const data = JSON.parse(wsMessage);

      if (data.type === "message") {
        const userMessage = data.content as string;

        // Persist user interaction to local Durable Object storage
        this
          .sql`CREATE TABLE IF NOT EXISTS chat_history (id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT, content TEXT)`;
        this
          .sql`INSERT INTO chat_history (role, content) VALUES ('user', ${userMessage})`;

        let enrichedPrompt = userMessage;

        // Detect GitHub Pull Request URLs
        const prMatch = userMessage.match(
          /https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/(\d+)/
        );

        if (prMatch) {
          const prUrl = prMatch[0];
          connection.send(
            JSON.stringify({
              type: "message",
              content: "🔗 Detected GitHub PR Link! Fetching diff..."
            })
          );

          try {
            // Local Cache Check
            this
              .sql`CREATE TABLE IF NOT EXISTS pr_cache (url TEXT PRIMARY KEY, diff TEXT, title TEXT)`;
            const cached = this.sql<{
              diff: string;
              title: string;
            }>`SELECT diff, title FROM pr_cache WHERE url = ${prUrl}`;

            let diff = "";
            let title = "";

            if (cached.length > 0) {
              diff = cached[0].diff;
              title = cached[0].title;
            } else {
              const urlPath = new URL(prUrl).pathname;
              const match = urlPath.match(/\/([^/]+)\/([^/]+)\/pull\/(\d+)/);

              if (!match) throw new Error("Invalid GitHub PR URL format");

              const [, owner, repo, prNumber] = match;
              const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;

              const [diffRes, metaRes] = await Promise.all([
                fetch(apiUrl, {
                  headers: {
                    Accept: "application/vnd.github.v3.diff",
                    Authorization: this.env.GITHUB_TOKEN
                      ? `token ${this.env.GITHUB_TOKEN}`
                      : "",
                    "User-Agent": "AppSec-Agent"
                  }
                }),
                fetch(apiUrl, {
                  headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: this.env.GITHUB_TOKEN
                      ? `token ${this.env.GITHUB_TOKEN}`
                      : "",
                    "User-Agent": "AppSec-Agent"
                  }
                })
              ]);

              if (!diffRes.ok)
                throw new Error(`GitHub API returned ${diffRes.status}`);

              diff = (await diffRes.text()).substring(0, 5000);
              const prInfo = (await metaRes.json()) as GitHubPRMetadata;
              title = prInfo.title;

              this
                .sql`INSERT OR REPLACE INTO pr_cache (url, diff, title) VALUES (${prUrl}, ${diff}, ${title})`;
            }

            enrichedPrompt = `User request: ${userMessage}\n\nAnalyze this PR Diff for OWASP vulnerabilities:\nPR Title: ${title}\n\n${diff}`;
          } catch (e) {
            const msg =
              e instanceof Error ? e.message : "GitHub integration error";
            connection.send(
              JSON.stringify({
                type: "message",
                content: `🚨 Failed to read PR: ${msg}`
              })
            );
            return;
          }

          connection.send(
            JSON.stringify({
              type: "message",
              content: "⏳ *Analyzing PR code against OWASP guidelines...*"
            })
          );
        } else {
          connection.send(
            JSON.stringify({
              type: "message",
              content: "⏳ *Thinking...*"
            })
          );
        }

        // Retrieve and format conversation history
        const history = this.sql<{
          role: "user" | "assistant";
          content: string;
        }>`SELECT role, content FROM chat_history`;

        if (history.length > 0) {
          history[history.length - 1].content = enrichedPrompt;
        }

        const messages: AIMessage[] = history.map((m) => ({
          role: m.role,
          content: m.content
        }));

        const workersai = createWorkersAI({ binding: this.env.AI });

        try {
          const result = await generateText({
            model: workersai(AI_MODEL, {
              sessionAffinity: this.ctx.id.toString()
            }),
            system: SYSTEM_PROMPT,
            messages: messages,
            maxTokens: 2048
          } as unknown as SecurityAgentAIRequest);

          const finalResponse =
            result.text || "⚠️ AI was unable to generate a security report.";

          this
            .sql`INSERT INTO chat_history (role, content) VALUES ('assistant', ${finalResponse})`;
          connection.send(
            JSON.stringify({ type: "message", content: finalResponse })
          );
        } catch (aiError) {
          const msg =
            aiError instanceof Error ? aiError.message : "Inference failed";
          connection.send(
            JSON.stringify({
              type: "message",
              content: `🚨 **Backend Error:** ${msg}`
            })
          );
        }
        return;
      }
    } catch (_e) {}
  }
}

export default {
  async fetch(request: Request, env: Env) {
    const agentResponse = await routeAgentRequest(request, env);
    if (agentResponse) return agentResponse;
    return new Response("AppSec Agent is active.", { status: 200 });
  }
};
