@"
import axios from 'axios'

const CLAUDE_COMMIT_URL = process.env.CLAUDE_COMMIT_URL

export async function loadClaudePrompt() {
  const res = await axios.get(CLAUDE_COMMIT_URL)
  return res.data
}
"@ | Out-File -Encoding utf8 claudePromptLoader.js
