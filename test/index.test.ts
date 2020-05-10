import nock from "nock";
import { join } from "path";
import { run } from "../src";

const { version } = require("../package.json");

const host = "https://rubygems.org";
const path = "/api/v2/rubygems/example/versions/1.2.3.json";
const fixture = join(__dirname, "fixtures", "gem");

describe("run", () => {
  beforeEach(() => {
    nock.cleanAll();
    nock.disableNetConnect();
  });

  test("-h", async () => {
    const { status, stdout } = await run(["-h"]);
    expect(status).toEqual(0);
    expect(stdout).toContain("is-unpublished");
  });

  test("--help", async () => {
    const { status, stdout } = await run(["--help"]);
    expect(status).toEqual(0);
    expect(stdout).toContain("is-unpublished");
  });

  test("-v", async () => {
    const { status, stdout } = await run(["-v"]);
    expect(status).toEqual(0);
    expect(stdout).toEqual(`${version}\n`);
  });

  test("--version", async () => {
    const { status, stdout } = await run(["--version"]);
    expect(status).toEqual(0);
    expect(stdout).toEqual(`${version}\n`);
  });

  test("an unpublished package", async () => {
    nock(host).get(path).reply(404);

    const { status, stdout } = await run([fixture]);
    expect(status).toEqual(0);
    expect(stdout).toEqual("example version 1.2.3 has not been published\n");
  });

  test("a published package", async () => {
    nock(host).get(path).reply(200);

    const { status, stdout } = await run([fixture]);
    expect(status).toEqual(1);
    expect(stdout).toEqual(
      "example version 1.2.3 has already been published\n"
    );
  });
});