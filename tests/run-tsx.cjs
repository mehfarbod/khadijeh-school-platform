const path = require("node:path");
const { spawnSync } = require("node:child_process");

const shimPath = path.resolve(__dirname, "node-userinfo-shim.cjs");
const existingNodeOptions = process.env.NODE_OPTIONS?.trim();
const nodeOptions = [existingNodeOptions, `--require=${shimPath}`]
  .filter(Boolean)
  .join(" ");

const result = spawnSync(
  process.execPath,
  [path.resolve(__dirname, "../node_modules/tsx/dist/cli.mjs"), ...process.argv.slice(2)],
  {
    env: { ...process.env, NODE_OPTIONS: nodeOptions },
    stdio: "inherit",
  },
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
