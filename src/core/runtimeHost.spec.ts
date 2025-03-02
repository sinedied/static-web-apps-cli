import path from "path";
import { createRuntimeHost } from "./runtimeHost";
import * as detectRuntime from "./runtimes";

let spyDetectRuntime: jest.SpyInstance;
const mockConfig = {
  appPort: 8080,
  appArtifactLocation: `.${path.sep}`,
  appLocation: `.${path.sep}`,
  proxyHost: "0.0.0.0",
  proxyPort: 4242,
};

describe("runtimeHost", () => {
  beforeEach(() => {
    process.env.DEBUG = "";
    spyDetectRuntime = jest.spyOn(detectRuntime, "detectRuntime");
    spyDetectRuntime.mockReturnValue(detectRuntime.RuntimeType.unknown);
  });

  describe("createRuntimeHost()", () => {
    it("appArtifactLocation should be propagated in resulting command", () => {
      const rh = createRuntimeHost({
        ...mockConfig,
        appArtifactLocation: "./foobar",
      });

      expect(spyDetectRuntime).toHaveBeenCalledWith(`.${path.sep}`);
      expect(rh.command).toContain(`http-server`);
      expect(rh.args).toEqual([
        "./foobar",
        "-d",
        "false",
        "--host",
        "0.0.0.0",
        "--port",
        "8080",
        "--cache",
        "-1",
        "--proxy",
        "http://0.0.0.0:4242/?",
      ]);
    });

    it("appArtifactLocation should default to ./ if undefined", () => {
      const rh = createRuntimeHost({
        ...mockConfig,
        appArtifactLocation: undefined,
      });

      expect(spyDetectRuntime).toHaveBeenCalledWith(`.${path.sep}`);
      expect(rh.command).toContain(`http-server`);
      expect(rh.args).toEqual([
        `.${path.sep}`,
        "-d",
        "false",
        "--host",
        "0.0.0.0",
        "--port",
        "8080",
        "--cache",
        "-1",
        "--proxy",
        "http://0.0.0.0:4242/?",
      ]);
    });

    it("proxyHost should be propagated in resulting command", () => {
      const rh = createRuntimeHost({
        ...mockConfig,
        proxyHost: "127.0.0.1",
      });

      expect(spyDetectRuntime).toHaveBeenCalledWith(`.${path.sep}`);
      expect(rh.command).toContain(`http-server`);
      expect(rh.args).toEqual([
        `.${path.sep}`,
        "-d",
        "false",
        "--host",
        "127.0.0.1",
        "--port",
        "8080",
        "--cache",
        "-1",
        "--proxy",
        "http://127.0.0.1:4242/?",
      ]);
    });

    it("proxyPort should be propagated in resulting command", () => {
      const rh = createRuntimeHost({
        ...mockConfig,
        proxyPort: 3000,
      });

      expect(spyDetectRuntime).toHaveBeenCalledWith(`.${path.sep}`);
      expect(rh.command).toContain(`http-server`);
      expect(rh.args).toEqual([
        `.${path.sep}`,
        "-d",
        "false",
        "--host",
        "0.0.0.0",
        "--port",
        "8080",
        "--cache",
        "-1",
        "--proxy",
        "http://0.0.0.0:3000/?",
      ]);
    });

    it("appLocation should be propagated to the runtime detector", () => {
      const rh = createRuntimeHost({
        ...mockConfig,
        appLocation: "./foobar",
      });

      expect(spyDetectRuntime).toHaveBeenCalledWith("./foobar");
      expect(rh.command).toContain(`http-server`);
      expect(rh.args).toEqual([
        `.${path.sep}`,
        "-d",
        "false",
        "--host",
        "0.0.0.0",
        "--port",
        "8080",
        "--cache",
        "-1",
        "--proxy",
        "http://0.0.0.0:4242/?",
      ]);
    });
  });
});
