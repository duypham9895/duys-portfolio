import { writeFileSync } from "fs";
import { exec } from "child_process";
import { transform } from "./transform";
import { renderTemplate } from "./template";

const PREVIEW_PATH = "/tmp/resume-preview.html";

const data = transform();
const html = renderTemplate(data);
writeFileSync(PREVIEW_PATH, html, "utf-8");

console.log(`Preview written to ${PREVIEW_PATH}`);
exec(`open ${PREVIEW_PATH}`, (error) => {
  if (error) {
    console.log(`Open it manually: file://${PREVIEW_PATH}`);
  }
});
