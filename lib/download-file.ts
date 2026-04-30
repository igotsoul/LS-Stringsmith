export function downloadFile(contents: string, fileName: string, mimeType: string) {
  const blob = new Blob([contents], {
    type: mimeType,
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
}
