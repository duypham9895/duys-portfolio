import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const scriptPath = resolve("scripts/vercel/ignore-git-build.mjs");

function runIgnoreScript(extraEnv: Record<string, string | undefined> = {}) {
  const env = { ...process.env };

  for (const [key, value] of Object.entries(extraEnv)) {
    if (value === undefined) {
      delete env[key];
    } else {
      env[key] = value;
    }
  }

  return spawnSync(process.execPath, [scriptPath], {
    cwd: process.cwd(),
    encoding: "utf-8",
    env,
  });
}

describe("Vercel Git build gate", () => {
  it("skips automatic Vercel Git builds", () => {
    const result = runIgnoreScript({ GITHUB_ACTIONS: undefined });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Skipping Vercel Git build");
  });

  it("allows the GitHub Actions prebuilt deployment pipeline to build", () => {
    const result = runIgnoreScript({ GITHUB_ACTIONS: "true" });

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("Continuing GitHub Actions build");
  });

  it("wires the gate into Vercel configuration", () => {
    const vercelConfig = JSON.parse(readFileSync("vercel.json", "utf-8"));

    expect(vercelConfig.ignoreCommand).toBe("node scripts/vercel/ignore-git-build.mjs");
  });
});
