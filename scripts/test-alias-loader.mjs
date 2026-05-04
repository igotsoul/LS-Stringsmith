import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const packageJsonPath = resolvePath(rootDir, "package.json");
const packageJsonUrl = pathToFileURL(packageJsonPath).href;
const candidateExtensions = ["", ".ts", ".tsx", ".js", ".mjs", ".json"];

function resolveWorkspaceSpecifier(specifier) {
  const basePath = resolvePath(rootDir, specifier.slice(2));

  for (const extension of candidateExtensions) {
    const candidate = `${basePath}${extension}`;

    if (existsSync(candidate)) {
      return pathToFileURL(candidate).href;
    }
  }

  return pathToFileURL(basePath).href;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    return nextResolve(resolveWorkspaceSpecifier(specifier), context);
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url === packageJsonUrl) {
    const source = await readFile(packageJsonPath, "utf8");

    return {
      format: "module",
      shortCircuit: true,
      source: `export default ${source};`,
    };
  }

  return nextLoad(url, context);
}
