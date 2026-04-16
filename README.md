# cf_ai_github_agent

> An AI powered Github pull request review Agent.

This application allows developers to drop a link to a GitHub Pull Request into a chat interface. The agent automatically fetches the code diff, analyzes it for bugs or improvements using an LLM, and provides a conversational code review. 

## Architecture & Required Components

This project was built entirely on Cloudflare's developer platform, satisfying the four assignment requirements:

1. **User Input (Chat):** Built using **Cloudflare Pages** and the Agents SDK (Kumo UI) for a seamless, real-time WebSocket chat interface.
2. **LLM:** Powered by **Workers AI** running the recommended `Llama-3.3` model to analyze the code diffs and reason about potential bugs.
3. **Workflow / Coordination:** Utilizes **Cloudflare Workflows** to reliably orchestrate the multi-step process of fetching external GitHub data, parsing the diff, and generating the AI review without timing out.
4. **Memory / State:** Backed by **Durable Objects** to maintain the WebSocket connection and preserve chat history, allowing users to ask conversational follow-up questions about the reviewed code.

## Local Development

To run this project locally, you will need Node.js.

**1. Clone the repository:**
\`\`\`bash
git clone https://github.com/paulobarb/cf_ai_github_agent.git
cd cf_ai_github_agent
\`\`\`

**2. Install dependencies:**
\`\`\`bash
npm install
\`\`\`

**3. Set up Environment Variables:**
Copy the `.env.example` file to create your local `.env` file:
\`\`\`bash
cp .env.example .env
\`\`\`

Open the new `.env` file and add your GitHub Personal Access Token:
\`\`\`env
GITHUB_TOKEN=your_token_here
\`\`\`

**4. Start the development server:**
\`\`\`bash
npm run dev
\`\`\`
The chat interface will be available at `http://localhost:5173`.

## AI Usage Note
AI assistance (Gemini/Cloude) was used to accelerate and debug configuration. All prompts and interactions are fully documented in the `PROMPTS.md` file located in the root of this repository.

---

## License

MIT - See [LICENSE](LICENSE)

---

## Contact

*Built by [Paulo Barbosa](https://github.com/paulobarb)*