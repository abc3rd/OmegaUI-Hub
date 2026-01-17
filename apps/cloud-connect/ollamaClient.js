@"
import axios from 'axios'

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434'
const MODEL_NAME = process.env.OLLAMA_MODEL || 'glytch'

export async function queryOllama(prompt) {
  const res = await axios.post(`${OLLAMA_HOST}/api/generate`, {
    model: MODEL_NAME,
    prompt: prompt,
    stream: false
  })
  return res.data.response
}
"@ | Out-File -Encoding utf8 ollamaClient.js
