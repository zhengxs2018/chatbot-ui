/* eslint-disable no-console */
import type { APIContext, APIRoute } from 'astro';

import { checkPass } from './auth';

const NUM = /(\d)(?=(\d\d\d)+(?!\d))/g;

export function humanize(n: string, delimiter = ',', separator = '.'): string {
  const [a, b] = n.toString().split('.');
  const c = a.replace(NUM, `$1${delimiter}`);
  return `${c}${b ? separator + b : ''}`;
}

export type Middleware = (
  next: (context: APIContext) => ReturnType<APIRoute>
) => APIRoute;

export const withAuth: Middleware = (next) => {
  return (context) => {
    if (checkPass(context.cookies.get('code').value)) return next(context);

    return new Response(
      JSON.stringify({ code: 401, message: '请登录后使用' }),
      {
        status: 401,
        statusText: 'Unauthorized',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  };
};

export const withLog: Middleware = (next) => {
  return (context) => {
    const start = new Date();
    const { url, method } = context.request;
    const { pathname } = new URL(url);

    console.log('%s <-- %s %s', start.toLocaleTimeString(), method, pathname);

    return Promise.resolve(next(context)).then(
      (response) => {
        const end = new Date();
        console.log(
          `%s --> %s %s %s %s`,
          end.toLocaleTimeString(),
          method,
          pathname,
          (response as Response).status,
          time(start.getTime(), end.getTime())
        );

        return response;
      },
      (ex) => {
        const end = new Date();
        console.log(
          `%s xxx %s %s %s %s`,
          end.toLocaleTimeString(),
          method,
          pathname,
          500,
          time(start.getTime(), end.getTime())
        );
        return Promise.reject(ex);
      }
    );
  };
};

export const withError: Middleware = (next) => (context) => {
  return Promise.resolve(next(context)).catch((ex) => {
    // eslint-disable-next-line no-console
    console.error(ex);
    return new Response(null, {
      status: ex.status || 500,
      statusText: ex.statusText || 'Internal Server Error',
    });
  });
};

function time(start: number, end: number) {
  const delta = end - start;

  return humanize(
    delta < 10000 ? `${delta}ms` : `${Math.round(delta / 1000)}s`
  );
}
