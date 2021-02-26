import mockFs from "mock-fs";
import path from "path";
import { argv, findSWAConfigFile, readConfigFile, response, traverseFolder, validateCookie } from "./utils";

describe("Utils", () => {
  beforeEach(() => {
    process.env.DEBUG = "";
    process.argv = [];
  });

  describe("argv()", () => {
    it("process.argv = []", () => {
      process.argv = [];
      expect(argv("--port")).toBe(null);
    });

    it("process.argv = ['--port']", () => {
      process.argv = ["--port"];
      expect(argv("--port")).toBe(true);
      expect(argv("--portxyz")).toBe(false);
    });

    it("process.argv = ['--port=4242']", () => {
      process.argv = ["--port=4242"];
      expect(argv("--port")).toBe("4242");
    });

    it("process.argv = ['--port  =   4242  ']", () => {
      process.argv = ["--port  =  4242  "];
      expect(argv("--port")).toBe("4242");
    });

    it("process.argv = ['--port', '4242']", () => {
      process.argv = ["--port", "4242"];
      expect(argv("--port")).toBe("4242");
    });

    it("process.argv = ['--port', '--other']", () => {
      process.argv = ["--port", "--other"];
      expect(argv("--port")).toBe(true);
    });

    it("process.argv = ['--port=']", () => {
      process.argv = ["--port="];
      expect(argv("--port")).toBe(null);
    });
  });

  describe("response()", () => {
    it("context = null", () => {
      expect(() => {
        response({
          context: null,
        });
      }).toThrow();
    });
    it("context.bindingData = {foo:bar} (DEBUG off)", () => {
      expect(
        response({
          status: 200,
          context: {
            bindingData: {
              foo: "bar",
            },
          },
        })
      ).toEqual({
        body: null,
        cookies: undefined,
        headers: { "Content-Type": "application/json", status: 200 },
        status: 200,
      });
    });
    it("context.bindingData = {foo:bar} (DEBUG on)", () => {
      process.env.DEBUG = "*";

      const res = response({
        status: 200,
        context: {
          bindingData: {
            foo: "bar",
          },
        },
      });
      expect(typeof res.body).toBe("string");
      expect(JSON.parse(res.body).debug).toBeDefined();
      expect(JSON.parse(res.body).debug.context).toBeDefined();
      expect(JSON.parse(res.body).debug.context.foo).toBe("bar");
    });

    it("status = null", () => {
      expect(() => {
        response({
          context: {
            bindingData: {},
          },
          status: null,
        });
      }).toThrow(/TypeError/);
    });

    it("status = 200", () => {
      const res = response({
        context: {
          bindingData: {},
        },
        status: 200,
      });
      expect(res.status).toBe(200);
      expect(res.headers.status).toBe(200);
    });

    it("body = null (DEBUG off)", () => {
      const res = response({
        status: 200,
        context: {
          bindingData: {},
        },
        body: null,
      });
      expect(res.body).toBe(null);
    });

    it("body = null (DEBUG on)", () => {
      process.env.DEBUG = "*";

      const res = response({
        status: 200,
        context: {
          bindingData: {
            foo: "bar",
          },
        },
        body: null,
      });
      expect(typeof res.body).toBe("string");
      expect(JSON.parse(res.body).debug).toBeDefined();
      expect(JSON.parse(res.body).debug.context).toBeDefined();
      expect(JSON.parse(res.body).debug.context.foo).toBe("bar");
    });

    it("body = {foo:bar} (DEBUG off)", () => {
      const res = response({
        status: 200,
        context: {
          bindingData: {},
        },
        body: {
          foo: "bar",
        },
      });
      expect(typeof res.body).toBe("object");
      expect(res.body.foo).toBeDefined();
      expect(res.body.foo).toBe("bar");
    });

    it("body = {foo:bar} (DEBUG on)", () => {
      process.env.DEBUG = "*";

      const res = response({
        status: 200,
        context: {
          bindingData: {},
        },
        body: {
          foo: "bar",
        },
      });
      expect(typeof res.body).toBe("object");
      expect(res.body.foo).toBeDefined();
      expect(res.body.foo).toBe("bar");
    });

    it("headers = null (DEBUG off)", () => {
      const res = response({
        status: 200,
        context: {
          bindingData: {},
        },
        headers: null,
      });
      expect(res.headers).toBeDefined();
      expect(res.headers.status).toBe(200);
      expect(res.headers["Content-Type"]).toBe("application/json");
    });

    it("headers = null (DEBUG on)", () => {
      process.env.DEBUG = "*";

      const res = response({
        status: 200,
        context: {
          bindingData: {},
        },
        headers: null,
      });
      expect(res.headers).toBeDefined();
      expect(res.headers.status).toBe(200);
      expect(res.headers["Content-Type"]).toBe("application/json");
    });

    it("headers = { foo: bar } (DEBUG off)", () => {
      const res = response({
        status: 200,
        context: {
          bindingData: {},
        },
        headers: {
          foo: "bar",
        },
      });
      expect(res.headers).toBeDefined();
      expect(res.headers.foo).toBe("bar");
      expect(res.headers.status).toBe(200);
      expect(res.headers["Content-Type"]).toBe("application/json");
    });

    it("headers = { foo: bar } (DEBUG on)", () => {
      process.env.DEBUG = "*";

      const res = response({
        status: 200,
        context: {
          bindingData: {},
        },
        headers: {
          foo: "bar",
        },
      });
      expect(res.headers).toBeDefined();
      expect(res.headers.foo).toBe("bar");
      expect(res.headers.status).toBe(200);
      expect(res.headers["Content-Type"]).toBe("application/json");
    });

    it("headers = { location: null } (DEBUG off)", () => {
      const res = response({
        status: 200,
        context: {
          bindingData: {},
        },
        headers: {
          location: null,
        },
      });
      expect(res.headers).toBeDefined();
      expect(res.headers.location).toBe(null);
      expect(res.headers.status).toBe(200);
      expect(res.headers["Content-Type"]).toBe("application/json");
    });

    it("headers = { location: null } (DEBUG on)", () => {
      process.env.DEBUG = "*";

      const res = response({
        status: 200,
        context: {
          bindingData: {},
        },
        headers: {
          location: null,
        },
      });
      expect(res.headers).toBeDefined();
      expect(res.headers.location).toBe(null);
      expect(res.headers.status).toBe(200);
      expect(res.headers["Content-Type"]).toBe("application/json");
    });

    it("headers = { location: 'wassim.dev' } (DEBUG off)", () => {
      const res = response({
        status: 200,
        context: {
          bindingData: {},
        },
        headers: {
          location: "wassim.dev",
        },
      });
      expect(res.headers).toBeDefined();
      expect(res.headers.location).toBe("wassim.dev");
      expect(res.headers.status).toBe(200);
      expect(res.headers["Content-Type"]).toBe("application/json");
    });

    it("headers = { location: 'wassim.dev' } (DEBUG on)", () => {
      process.env.DEBUG = "*";

      const res = response({
        status: 200,
        context: {
          bindingData: {},
        },
        headers: {
          location: "wassim.dev",
        },
      });
      expect(res.headers).toBeDefined();
      expect(res.headers.location).toBe(null);
      expect(res.headers.status).toBe(200);
      expect(res.headers["Content-Type"]).toBe("application/json");
    });

    it("cookies = null", () => {
      const res = response({
        status: 200,
        context: {
          bindingData: {},
        },
        cookies: null,
      });

      expect(res.cookies).toBe(null);
    });

    it("cookies = { foo:bar }", () => {
      const res = response({
        status: 200,
        context: {
          bindingData: {},
        },
        cookies: {
          foo: "bar",
        },
      });
      expect(res.cookies).toBeDefined();
      expect(res.cookies!.foo).toBe("bar");
    });
  });

  describe("validateCookie()", () => {
    it("cookies = ''", () => {
      expect(validateCookie("")).toBe(false);
    });

    it("cookies = 'abc'", () => {
      expect(validateCookie("")).toBe(false);
    });

    it("cookies = 'foo=bar'", () => {
      expect(validateCookie("foo=bar")).toBe(false);
    });
  });

  describe("readConfigFile()", () => {
    it("config file not found should return undefined", () => {
      expect(readConfigFile()).toBe(undefined);
    });

    it("config file with wrong filename should return undefined", () => {
      mockFs({
        ".github/workflows/wrong-file-name-pattern.yml": "",
      });

      expect(readConfigFile()).toBe(undefined);

      mockFs.restore();
    });

    it("invalid YAML file should throw", () => {
      mockFs({
        ".github/workflows/azure-static-web-apps__not-valid.yml": "",
      });

      expect(() => readConfigFile()).toThrow(/could not parse the SWA workflow file/);

      mockFs.restore();
    });

    describe("checking workflow properties", () => {
      it("missing property 'jobs' should throw", () => {
        mockFs({
          ".github/workflows/azure-static-web-apps__not-valid.yml": `name: Azure Static Web Apps CI/CD`,
        });

        expect(() => readConfigFile()).toThrow(/missing property 'jobs'/);

        mockFs.restore();
      });

      it("missing property 'jobs.build_and_deploy_job' should throw", () => {
        mockFs({
          ".github/workflows/azure-static-web-apps.yml": `
jobs:
  invalid_property:
`,
        });
        expect(() => readConfigFile()).toThrow(/missing property 'jobs.build_and_deploy_job'/);

        mockFs.restore();
      });

      it("missing property 'jobs.build_and_deploy_job.steps' should throw", () => {
        mockFs({
          ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    invalid_property:
`,
        });

        expect(() => readConfigFile()).toThrow(/missing property 'jobs.build_and_deploy_job.steps'/);

        mockFs.restore();
      });

      it("invalid property 'jobs.build_and_deploy_job.steps' should throw", () => {
        mockFs({
          ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
`,
        });
        expect(() => readConfigFile()).toThrow(/missing property 'jobs.build_and_deploy_job.steps'/);

        mockFs.restore();
      });

      it("invalid property 'jobs.build_and_deploy_job.steps[]' should throw", () => {
        mockFs({
          ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
`,
        });

        expect(() => readConfigFile()).toThrow(/invalid property 'jobs.build_and_deploy_job.steps\[\]'/);

        mockFs.restore();
      });

      it("missing property 'jobs.build_and_deploy_job.steps[].with' should throw", () => {
        mockFs({
          ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
`,
        });

        expect(() => readConfigFile()).toThrow(/missing property 'jobs.build_and_deploy_job.steps\[\].with'/);

        mockFs.restore();
      });
    });

    describe("checking SWA properties", () => {
      it("property 'app_location' should be set", () => {
        mockFs({
          ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          app_location: "/"
`,
        });

        expect(readConfigFile()).toBeTruthy();
        expect(readConfigFile()?.appLocation).toBe(path.normalize(process.cwd() + "/"));

        mockFs.restore();
      });

      it("property 'app_location' should be set to '/' if missing", () => {
        mockFs({
          ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          foo: bar
`,
        });
        expect(readConfigFile()).toBeTruthy();
        expect(readConfigFile()?.appLocation).toBe(path.normalize(process.cwd() + "/"));

        mockFs.restore();
      });

      it("property 'api_location' should be set", () => {
        mockFs({
          ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          api_location: "/api"
`,
        });

        expect(readConfigFile()).toBeTruthy();
        expect(readConfigFile()?.apiLocation).toBe(path.normalize(process.cwd() + "/api"));

        mockFs.restore();
      });

      it("property 'api_location' should be undefined if missing", () => {
        mockFs({
          ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          foo: bar
`,
        });

        expect(readConfigFile()).toBeTruthy();
        expect(readConfigFile()?.apiLocation).toBeUndefined();

        mockFs.restore();
      });

      it("property 'app_artifact_location' should be set", () => {
        mockFs({
          ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          app_artifact_location: "/"
`,
        });

        expect(readConfigFile()).toBeTruthy();
        expect(readConfigFile()?.appArtifactLocation).toBe(path.normalize(process.cwd() + "/"));

        mockFs.restore();
      });

      it("property 'app_artifact_location' should be set to '/' if missing", () => {
        mockFs({
          ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          foo: bar
`,
        });

        expect(readConfigFile()).toBeTruthy();
        expect(readConfigFile()?.appArtifactLocation).toBe(path.normalize(process.cwd() + "/"));

        mockFs.restore();
      });

      it("property 'app_build_command' should be set", () => {
        mockFs({
          ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          app_build_command: "echo test"
`,
        });

        expect(readConfigFile()).toBeTruthy();
        expect(readConfigFile()?.appBuildCommand).toBe("echo test");

        mockFs.restore();
      });

      it("property 'app_build_command' should be set to default if missing", () => {
        mockFs({
          ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          foo: bar
`,
        });

        expect(readConfigFile()).toBeTruthy();
        expect(readConfigFile()?.appBuildCommand).toBe("npm run build --if-present");

        mockFs.restore();
      });

      it("property 'api_build_command' should be set", () => {
        mockFs({
          ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          api_build_command: "echo test"
`,
        });

        expect(readConfigFile()).toBeTruthy();
        expect(readConfigFile()?.apiBuildCommand).toBe("echo test");

        mockFs.restore();
      });

      it("property 'api_build_command' should be set to default if missing", () => {
        mockFs({
          ".github/workflows/azure-static-web-apps.yml": `
jobs:
  build_and_deploy_job:
    steps:
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          foo: bar
`,
        });

        expect(readConfigFile()).toBeTruthy();
        expect(readConfigFile()?.apiBuildCommand).toBe("npm run build --if-present");

        mockFs.restore();
      });
    });
  });

  describe("traverseFolder()", () => {
    const asyncGeneratorToArray = async (gen: AsyncGenerator<string, string, unknown>) => {
      const entries: string[] = [];
      for await (const entry of gen) {
        entries.push(entry);
      }
      return entries;
    };

    it("should handle empty folders", async () => {
      mockFs();

      const entry = await asyncGeneratorToArray(traverseFolder("."));
      expect(entry).toEqual([]);

      mockFs.restore();
    });

    describe("should handle flat folder", async () => {
      it("with single entry", async () => {
        mockFs({
          "foo.txt": "fake content",
        });

        const entries = await asyncGeneratorToArray(traverseFolder("."));
        expect(entries.length).toBe(1);

        // entries are populated indeterminately because of async generator
        expect(entries.find((entry) => entry.endsWith("foo.txt"))).toEndWith("foo.txt");

        mockFs.restore();
      });

      it("with multiple entries", async () => {
        mockFs({
          "foo.txt": "fake content",
          "bar.jpg": "fake content",
        });

        const entries = await asyncGeneratorToArray(traverseFolder("."));
        expect(entries.length).toBe(2);

        // entries are populated indeterminately because of async generator
        expect(entries.find((entry) => entry.endsWith("bar.jpg"))).toEndWith("bar.jpg");
        expect(entries.find((entry) => entry.endsWith("foo.txt"))).toEndWith("foo.txt");

        mockFs.restore();
      });
    });

    describe("should handle deep folders", async () => {
      it("with single entry", async () => {
        mockFs({
          swa: {
            "foo.txt": "fake content",
          },
        });

        const entries = await asyncGeneratorToArray(traverseFolder("."));
        expect(entries.length).toBe(1);

        // entries are populated indeterminately because of async generator
        expect(entries.find((entry) => entry.endsWith(`swa${path.sep}foo.txt`))).toEndWith(`swa${path.sep}foo.txt`);

        mockFs.restore();
      });

      it("with multiple entries", async () => {
        mockFs({
          swa: {
            "foo.txt": "fake content",
          },
          "bar.jpg": "fake content",
        });

        const entries = await asyncGeneratorToArray(traverseFolder("."));
        expect(entries.length).toBe(2);

        // entries are populated indeterminately because of async generator
        expect(entries.find((entry) => entry.endsWith("bar.jpg"))).toEndWith("bar.jpg");
        expect(entries.find((entry) => entry.endsWith(`swa${path.sep}foo.txt`))).toEndWith(`swa${path.sep}foo.txt`);

        mockFs.restore();
      });
    });

    describe("should exclude folders", async () => {
      it("node_modules", async () => {
        mockFs({
          "foo.txt": "fake content",
          swa: {
            "bar.jpg": "fake content",
          },
          node_modules: {
            "bar.txt": "fake content",
          },
        });

        const entries = await asyncGeneratorToArray(traverseFolder("."));

        expect(entries.length).toBe(2);

        // entries are populated indeterminately because of async generator
        expect(entries.find((entry) => entry.endsWith(`swa${path.sep}bar.jpg`))).toEndWith(`swa${path.sep}bar.jpg`);
        expect(entries.find((entry) => entry.endsWith("foo.txt"))).toEndWith("foo.txt");

        mockFs.restore();
      });
    });
  });

  describe("findSWAConfigFile()", () => {
    it("should find no config file", async () => {
      mockFs({});

      const file = await findSWAConfigFile(".");
      expect(file).toBe(null);

      mockFs.restore();
    });

    it("should find staticwebapp.config.json (at the root)", async () => {
      mockFs({
        "staticwebapp.config.json": `{ "routes": []}`,
      });

      const file = await findSWAConfigFile(".");
      expect(file).toContain("staticwebapp.config.json");

      mockFs.restore();
    });

    it("should find staticwebapp.config.json (recursively)", async () => {
      mockFs({
        s: {
          w: {
            a: {
              "staticwebapp.config.json": `{ "routes": []}`,
            },
          },
        },
      });

      const file = await findSWAConfigFile(".");
      expect(file).toContain("staticwebapp.config.json");

      mockFs.restore();
    });

    it("should find routes.json (at the root)", async () => {
      mockFs({
        "routes.json": `{ "routes": []}`,
      });

      const file = await findSWAConfigFile(".");
      expect(file).toContain("routes.json");

      mockFs.restore();
    });

    it("should find routes.json (recursively)", async () => {
      mockFs({
        s: {
          w: {
            a: {
              "routes.json": `{ "routes": []}`,
            },
          },
        },
      });

      const file = await findSWAConfigFile(".");
      expect(file).toContain("routes.json");

      mockFs.restore();
    });

    it("should ignore routes.json if a staticwebapp.config.json exists", async () => {
      mockFs({
        s: {
          w: {
            "staticwebapp.config.json": `{ "routes": []}`,
            a: {
              "routes.json": `{ "routes": []}`,
            },
          },
        },
      });

      const file = await findSWAConfigFile(".");
      expect(file).toContain("staticwebapp.config.json");

      mockFs.restore();
    });
  });
});
