import Groq from 'groq-sdk'

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY não está definida nas variáveis de ambiente')
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})
