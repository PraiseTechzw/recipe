import { execFileSync } from "node:child_process";

if (process.env.EAS_BUILD_PLATFORM && process.env.POSTHOG_CLI_API_KEY) {
  console.log("Installing the PostHog CLI for authenticated release source-map uploads.");
  execFileSync("npm", ["install", "--global", "@posthog/cli@0.18.10"], {
    stdio: "inherit",
  });
} else {
  console.log("Skipping the PostHog CLI install outside authenticated EAS builds.");
}
