// Blob → file download (SISTEM_TASARIMI §2.2 app/download).

export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick so the navigation has started.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
