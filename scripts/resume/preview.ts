import { writeFileSync } from "fs";
import { exec } from "child_process";
import { transform } from "./transform";
import { renderTemplate, type ResumeTheme } from "./template";

const argTheme = process.argv[2];
const theme: ResumeTheme = argTheme === "dark" ? "dark" : "light";
const PREVIEW_PATH = `/tmp/resume-preview-${theme}.html`;

const data = transform();
const html = renderTemplate(data, theme);
writeFileSync(PREVIEW_PATH, html, "utf-8");

console.log(`Preview (${theme}) written to ${PREVIEW_PATH}`);
exec(`open ${PREVIEW_PATH}`, (error) => {
  if (error) {
    console.log(`Open it manually: file://${PREVIEW_PATH}`);
  }
});
