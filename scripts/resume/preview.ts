import { writeFileSync } from "fs";
import { exec } from "child_process";
import { tmpdir } from "os";
import { join } from "path";
import { transform } from "./transform";
import { renderTemplate } from "./template";

const PREVIEW_PATH = join(tmpdir(), "resume-preview.html");

writeFileSync(PREVIEW_PATH, renderTemplate(transform()), "utf-8");

console.log(`Preview written to ${PREVIEW_PATH}`);
exec(`open "${PREVIEW_PATH}"`, (error) => {
  if (error) {
    console.log(`Open it manually: file://${PREVIEW_PATH}`);
  }
});
