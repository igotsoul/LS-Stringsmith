import path from "node:path";
import { spawn } from "node:child_process";

const [, , command, ...args] = process.argv;

if (!command) {
  console.error("Usage: node scripts/next-with-wasm.mjs <next-command> [...args]");
  process.exit(1);
}

const nextBinary = path.join(process.cwd(), "node_modules", ".bin", "next");
const wasmDir = path.join(process.cwd(), "node_modules", "@next", "swc-wasm-nodejs");
const localToolsDir = path.join(process.cwd(), ".tools", "bin");

const child = spawn(nextBinary, [command, ...args], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_TEST_WASM_DIR: wasmDir,
    PATH: `${localToolsDir}${path.delimiter}${process.env.PATH ?? ""}`,
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
