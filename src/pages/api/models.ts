import type { APIRoute } from 'astro';

import { OPENAI_API_HOST, OPENAI_ORGANIZATION, OPENAI_API_KEY } from '@/utils/app/const';
import { OpenAIModel, OpenAIModelID, OpenAIModels, OpenAIChatModels } from '@/types/openai';

import { withError, withLog, withAuth } from '@/shared/node/middleware'

export const post: APIRoute = withError(withLog(withAuth(async ({ request }): Promise<Response> => {
  try {
    const { key, organization } = await request.json()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key || OPENAI_API_KEY}`,
    }

    if (organization || OPENAI_ORGANIZATION) {
      headers['OpenAI-Organization'] = organization || OPENAI_ORGANIZATION
    }

    const response = await fetch(`${OPENAI_API_HOST}/v1/models`, { headers });

    if (response.status === 401) {
      return new Response(response.body, {
        status: 500,
        headers: response.headers,
      });
    }

    if (response.status !== 200) {
      console.error(
        `OpenAI API returned an error ${response.status
        }: ${await response.text()}`,
      );
      throw new Error('OpenAI API returned an error');
    }

    const json = await response.json();

    const models: OpenAIModel[] = json.data
      .filter((model: any) => OpenAIChatModels.includes(model.id))
      .map((model: any) => ({
        id: model.id,
        name: OpenAIModels[model.id as unknown as OpenAIModelID].name,
      }))

    return new Response(JSON.stringify(models), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
})));
