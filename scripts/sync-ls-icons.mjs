import { mkdir, readFile, writeFile } from "node:fs/promises";

const manifestUrl = new URL("../domain/workshop/ls-icon-sources.json", import.meta.url);
const outputDirUrl = new URL("../public/icons/official/", import.meta.url);

function decodeHtmlEntities(value) {
  return value.replaceAll("&amp;", "&");
}

function extractIconUrl(html, source) {
  const urls = Array.from(
    html.matchAll(/https:\/\/liberatingstructures\.de\/wp-content\/uploads\/[^"' <>)]+/g),
    (match) => decodeHtmlEntities(match[0]),
  );

  return urls.find((url) => url.endsWith(source.sourceImagePattern)) ?? null;
}

async function fetchOk(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return response;
}

async function syncIcon(source) {
  let iconUrl = source.sourceImageUrl ?? null;

  if (!iconUrl) {
    const pageResponse = await fetchOk(source.pageUrl);
    const pageHtml = await pageResponse.text();
    iconUrl = extractIconUrl(pageHtml, source);
  }

  if (!iconUrl) {
    throw new Error(`Could not find ${source.sourceImagePattern} on ${source.pageUrl}`);
  }

  const iconResponse = await fetchOk(iconUrl);
  const contentType = iconResponse.headers.get("content-type") ?? "";

  if (!contentType.includes("image/")) {
    throw new Error(`Expected an image for ${source.title}, received ${contentType}`);
  }

  const bytes = Buffer.from(await iconResponse.arrayBuffer());
  const outputUrl = new URL(source.fileName, outputDirUrl);

  await writeFile(outputUrl, bytes);

  return {
    title: source.title,
    iconUrl,
    output: outputUrl.pathname,
  };
}

const sources = JSON.parse(await readFile(manifestUrl, "utf8"));

await mkdir(outputDirUrl, { recursive: true });

const results = [];

for (const source of sources) {
  results.push(await syncIcon(source));
}

for (const result of results) {
  console.log(`${result.title}: ${result.iconUrl} -> ${result.output}`);
}
