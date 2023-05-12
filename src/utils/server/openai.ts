import type { Message } from '@/types/chat';
import type { OpenAIModel } from '@/types/openai';

import { OPENAI_API_HOST, OPENAI_API_KEY, OPENAI_CHAT_MODEL, OPENAI_ORGANIZATION, DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '../app/const';

import { fetchSSE } from '../sse'

export class OpenAIError extends Error {
  type: string;
  param: string;
  code: string;

  constructor(message: string, type: string, param: string, code: string) {
    super(message);
    this.name = 'OpenAIError';
    this.type = type;
    this.param = param;
    this.code = code;
  }
}

export class OpenAI {
  apiKey: string = OPENAI_API_KEY
  organization: string = OPENAI_ORGANIZATION
  model: string = OPENAI_CHAT_MODEL
  temperature: number = DEFAULT_TEMPERATURE
  systemMessage: string = DEFAULT_SYSTEM_PROMPT

  async sendMessage(messages: Message[], options: {
    apiKey?: string;
    organization?: string
    model?: string
    temperature?: number
    systemMessage?: string
    onProgress: (result: unknown) => void
  }) {
    const {
      model,
      apiKey,
      organization,
      systemMessage,
      temperature = this.temperature,
      onProgress,
    } = options

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey || this.apiKey}`,
    }

    if (organization || this.organization) {
      headers['OpenAI-Organization'] = organization || this.organization
    }

    await fetchSSE(`${OPENAI_API_HOST}/v1/chat/completions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: model || this.model,
        temperature,
        stream: true,
        messages: [
          {
            role: 'system',
            content: systemMessage || this.systemMessage,
          },
          ...messages,
        ]
      }),
      async onopen(res) {
        if (res.status === 200) return

        const result = await res.json();

        if (result.error) {
          throw new OpenAIError(
            result.error.message,
            result.error.type,
            result.error.param,
            result.error.code,
          );
        }

        throw new Error(
          `OpenAI API returned an error: ${result?.value || result.statusText || res.statusText
          }`,
        );
      },
      onmessage(chunk) {
        try {
          const response = JSON.parse(chunk)

          if (response.detail?.type === 'invalid_request_error') {
            const { message, code, type } = response.detail

            throw new OpenAIError(
              `ChatGPT error ${message}: ${code} (${type})`,
              type,
              '',
              code,
            );
          }

          if (response.choices?.length) {
            onProgress(response)
          }

        } catch (err) {
          console.warn('OpenAI stream SEE event unexpected error', err)
          throw new Error('OpenAI stream SEE event unexpected error');
        }
      }
    })
  }
}

const openai = new OpenAI()

export const OpenAIStream = async (
  model: OpenAIModel,
  systemMessage: string,
  temperature: number,
  apiKey: string,
  messages: Message[],
) => {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        await openai.sendMessage(messages, {
          apiKey,
          systemMessage,
          model: model.id,
          temperature,
          onProgress(response: any) {
            const item = response.choices[0]
            const content = item.delta.content;

            if (content) {
              controller.enqueue(encoder.encode(content))
            }

            if (item.finish_reason) controller.close()
          }
        })
      } catch (ex) {
        controller.error(ex)
      }
    },
  });

  return stream;
};
