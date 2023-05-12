/* eslint-disable @typescript-eslint/ban-ts-comment */

import type { APIRoute } from 'astro';

import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import { OpenAIError, OpenAIStream } from '@/utils/server/openai';
import type { ChatBody, Message } from '@/types/chat';

import { withError, withLog, withAuth } from '@/shared/node/middleware'

// @ts-ignore
import tiktoken from 'tiktoken-node';

export const post: APIRoute = withError(withLog(withAuth(async ({ request }): Promise<Response> => {
  try {
    const { model, messages, key, prompt, temperature } = (await request.json()) as ChatBody;

    const encoding = tiktoken.encodingForModel(model.id)

    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT;
    }

    let temperatureToUse = temperature;
    if (temperatureToUse == null) {
      temperatureToUse = DEFAULT_TEMPERATURE;
    }

    const prompt_tokens = encoding.encode(promptToSend);

    let tokenCount = prompt_tokens.length;
    let messagesToSend: Message[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const tokens = encoding.encode(message.content);

      if (tokenCount + tokens.length + 1000 > model.tokenLimit) {
        break;
      }
      tokenCount += tokens.length;
      messagesToSend = [message, ...messagesToSend];
    }

    const stream = await OpenAIStream(model, promptToSend, temperatureToUse, key, messagesToSend);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('[ERROR] api/chat ', error);

    if (error instanceof OpenAIError) {
      return new Response('Error', { status: 500, statusText: error.message });
    } else {
      return new Response('Error', { status: 500 });
    }
  }
})));
