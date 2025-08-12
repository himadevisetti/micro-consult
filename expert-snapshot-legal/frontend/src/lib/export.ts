export async function exportPDF(html: string, filename: string): Promise<Blob> {
  const response = await fetch('/api/export-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ html, filename }),
  });

  if (!response.ok) {
    throw new Error(`Export failed: ${response.statusText}`);
  }

  return await response.blob();
}
