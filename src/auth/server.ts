import { createServer, ServerResponse } from "http";
import { argv, serializeCookie } from "../core/utils";
import url from "url";

const port = argv<number>("--port") || 4242;
const host = argv<string>("--host") || "localhost";

const authPaths: Path[] = [
  {
    method: "GET",
    route: /^\/app\/\.auth\/login\/(?<provider>aad|github|twitter|google|facebook|[a-z]+)/,
    function: "app_auth_login_provider",
  },
  {
    method: "GET",
    route: /^\/app\/\.auth\/me/,
    function: "app_auth_me",
  },
  {
    method: "GET",
    route: /^\/app\/\.auth\/logout/,
    function: "app_auth_logout",
  },
];

async function routeMatcher(url = "/"): Promise<{ func: Function | undefined; bindingData: undefined | { provider: string } }> {
  for (let index = 0; index < authPaths.length; index++) {
    const path = authPaths[index];
    const match = url.match(new RegExp(path.route));
    if (match) {
      let bindingData: any;
      if (match.groups?.provider) {
        bindingData = {
          provider: match.groups.provider,
        };
      }

      const func = (await import(`./routes/${path.function}`)).default as Function;
      return { func, bindingData };
    }
  }

  return { func: undefined, bindingData: undefined };
}

export async function requestHandler(request: ServerRequest, response: ServerResponse) {
  let defaultStatus = 200;
  const context: Context = {
    invocationId: new Date().getTime().toString(36) + Math.random().toString(36).slice(2),
    bindingData: undefined,
    res: {},
  };

  const { func, bindingData } = await routeMatcher(request.url);
  if (func) {
    context.bindingData = bindingData;
    try {
      // populate the query property so other functions can access it.
      request.query = url.parse(request?.url || "", true).query;

      await func(context, request);

      for (const key in context.res.headers) {
        const element = context.res.headers[key];
        if (element) {
          response.setHeader(key, element);
        }
      }

      // set auth cookies
      if (context.res.cookies) {
        const serializedCookies = context.res.cookies?.map((cookie) => {
          if (cookie.expires) {
            cookie.expires = new Date(cookie.expires);
          }
          return serializeCookie(cookie.name as string, cookie.value as string, cookie);
        });
        response.setHeader("Set-Cookie", serializedCookies);
      }

      // enable CORS for all requests
      response.setHeader("Access-Control-Allow-Origin", request.headers.origin || "*");
      response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
      response.setHeader("Access-Control-Allow-Credentials", "true");

      // set JSON response by default (if no content type was set)
      if (response.hasHeader("Content-Type") === false) {
        response.setHeader("Content-Type", "application/json");
      }

      // if response type is JSON, serialize body response
      if (response.getHeader("Content-Type")?.toString().includes("json") && typeof context.res.body === "object") {
        context.res.body = JSON.stringify(context.res.body) as string;
      }
    } catch (error) {
      console.error(error);

      defaultStatus = 500;
      context.res.body = {
        error: error.toString(),
      };
    }
  } else {
    defaultStatus = 404;
  }

  console.log("Response Headers", JSON.stringify(response.getHeaders(), null, 2));
  response.writeHead(context.res.status || defaultStatus);
  response.end(context.res.body);
}

const server = createServer(requestHandler);

server.listen(Number(port), host, () => {
  const { address, port } = server.address() as any; /* AddressInfo */
  const host = `http://${address}:${port}`;
  console.log(`Auth server listening on ${host}`);
});
