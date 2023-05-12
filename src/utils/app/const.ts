export const DEFAULT_SYSTEM_PROMPT = import.meta.env.DEFAULT_SYSTEM_PROMPT || "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown."

export const DEFAULT_TEMPERATURE = 0.9;

export const OPENAI_API_HOST =
  import.meta.env.OPENAI_API_HOST || 'https://api.openai.com';

export const OPENAI_API_KEY =
  import.meta.env.OPENAI_API_KEY || '';

export const OPENAI_CHAT_MODEL =
  import.meta.env.OPENAI_CHAT_MODEL || 'gpt-3.5-turbo';

export const OPENAI_ORGANIZATION =
  import.meta.env.OPENAI_ORGANIZATION || '';
