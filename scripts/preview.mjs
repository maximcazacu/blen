import { spawn } from "node:child_process";
const port = process.env.PORT || "3000";
if (!/^\d{1,5}$/.test(port) || +port < 1024 || +port > 65535) throw new Error("Choose a port from 1024 to 65535.");
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", port], {
  stdio: "inherit",
  env: { ...process.env, FLOWELIX_PREVIEW: "1", FLOWELIX_ORIGIN: "http://127.0.0.1:" + port },
});
server.on("exit", code => process.exit(code ?? 1));
