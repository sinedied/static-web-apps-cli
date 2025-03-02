import { response } from "../../core/utils";
const SWA_CLI_HOST = "http://localhost:" + process.env.SWA_CLI_PORT;

const httpTrigger = async function (context: Context, req: ServerRequest) {
  const { post_logout_redirect_uri } = req.query;
  context.res = response({
    context,
    status: 302,
    cookies: [
      {
        name: "StaticWebAppsAuthCookie",
        value: "deleted",
        path: "/",
        HttpOnly: false,
        domain: "localhost",
        expires: new Date(1).toUTCString(),
      },
    ],
    headers: {
      location: `${SWA_CLI_HOST}${post_logout_redirect_uri || ""}`,
    },
  });
};

export default httpTrigger;
