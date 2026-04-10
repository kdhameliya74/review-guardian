# AI Code Review Bot 🚀

An automated code review assistant powered by Google Gemini AI. This bot integrates with GitHub and automatically analyzes Pull Request diffs, providing constructive feedback and suggestions directly on the code lines.

## 🌟 Features

-   **AI-Powered Analysis**: Uses Google Gemini (1.5 Flash by default) to understand code context and logic.
-   **Automated Reviews**: Automatically triggers on PR creation and updates.
-   **Rate Limit Management**: Built-in queue management (12 RPM) to stay safely within free-tier limits.
-   **Robust Error Handling**: Automatic retries with exponential backoff for transient API errors (e.g., 429 Rate Limit).
-   **Dual Authentication**: Supports both GitHub Personal Access Tokens (PAT) and GitHub Apps.
-   **JSON-Structured Feedback**: Ensures consistent and parsable review comments.

## 🏗️ Workflow

The bot operates by listening to GitHub Webhooks, fetching the PR diff, analyzing it via AI, and posting the results back as line-specific comments.

![Workflow Diagram](./docs/AI-review-bot-workflow.svg)

## ⚙️ Configuration

Copy the `.env.example` to `.env` and fill in the following variables:

| Variable | Description | Required |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Your Google Gemini API Key | **Yes** |
| `GITHUB_WEBHOOK_SECRET` | Secret used to sign GitHub webhooks | **Yes** |
| `GITHUB_PAT` | GitHub Personal Access Token (for PAT auth) | Optional* |
| `GITHUB_APP_ID` | GitHub App ID (for App auth) | Optional* |
| `GITHUB_PRIVATE_KEY` | Base64 encoded Private Key (for App auth) | Optional* |
| `GEMINI_MODEL` | Gemini model name (default: `gemini-1.5-flash`) | No |
| `PORT` | Local server port (default: `3000`) | No |

*\*Either `GITHUB_PAT` or `GITHUB_APP_ID`/`GITHUB_PRIVATE_KEY` must be provided.*

## 🚀 Getting Started

1.  **Clone and Install**:
    ```bash
    git clone https://github.com/kdhameliya74/ai-code-review-bot.git
    cd ai-code-review-bot
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env` file based on `.env.example` and fill in your secrets.

3.  **Run the Server**:
    ```bash
    npm run dev
    ```

4.  **Expose Locally (Optional)**:
    If testing locally, use a tool like `ngrok` to expose your port 3000 to the internet so GitHub can reach your webhook endpoint (`/webhook`).

## 🛠️ Tech Stack

-   **Runtime**: Node.js
-   **AI**: @google/generative-ai (Gemini)
-   **GitHub API**: Octokit
-   **Server**: Express.js