const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

if (isGitHubActions) {
  console.log("Continuing GitHub Actions build for prebuilt Vercel deployment.");
  process.exit(1);
}

console.log(
  "Skipping Vercel Git build. GitHub Actions deploys prebuilt output with Playwright dependencies."
);
process.exit(0);
