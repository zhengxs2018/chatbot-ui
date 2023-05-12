
import {
  type ParsedEvent,
  type ReconnectInterval,
  createParser,
} from 'eventsource-parser';


export class SSEError extends Error {
  statusCode?: number
  statusText?: string
}

export type FetchSSEOptions = globalThis.RequestInit & {
  onopen?: (res: Response) => void | Promise<void>
  onmessage: (data: string) => void
  onerror?: (error: any) => void
}

export const fetchSSE = async (
  input: RequestInfo | URL,
  options: FetchSSEOptions,
  fetch = globalThis.fetch
) => {
  const { onopen, onmessage, onerror, ...init } = options

  const res = await fetch(input, init);
  if (await onopen?.(res)) return

  const onParse = (event: ParsedEvent | ReconnectInterval) => {
    if (event.type === 'event') {
      const chunk = event.data
      if (chunk === '[DONE]') return

      onmessage(chunk)
    }
  };

  const parser = createParser(onParse);

  if (res.body) {
    const decoder = new TextDecoder()

    for await (const chunk of streamAsyncIterable(res.body)) {
      parser.feed(decoder.decode(chunk))
    }
  } else {
    throwOrCallback(new Error('missing response body'), onerror)
  }
};

function throwOrCallback(error: Error, callback?: (error: Error) => void) {
  if (typeof callback === 'function') {
    callback(error)
  } else {
    throw error
  }
}

export async function* streamAsyncIterable<T>(stream: ReadableStream<T>) {
  const reader = stream.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) return

      yield value
    }
  } finally {
    reader.releaseLock()
  }
}
