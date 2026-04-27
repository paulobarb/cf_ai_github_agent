// src/types.ts

export interface Env {
  // oxlint-disable-next-line
  ChatAgent: DurableObjectNamespace<any>;
  // oxlint-disable-next-line
  AI: any;
  GITHUB_TOKEN: string;
}

export interface GitHubPRMetadata {
  title: string;
  user: { login: string };
  changed_files: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
