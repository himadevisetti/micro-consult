import html2pdf from 'html2pdf.js';

export async function generatePDF(previewElement?: HTMLElement): Promise<Blob> {
  if (typeof window === 'undefined') {
    throw new Error('PDF generation must run on the client');
  }

  if (!previewElement) {
    throw new Error('Retainer preview element not found');
  }

  const html2pdf = (await import('html2pdf.js')).default;

  const opt = {
    margin: 0.5,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  };

  return new Promise<Blob>((resolve, reject) => {
    html2pdf()
      .set(opt)
      .from(previewElement)
      .toPdf()
      .output('blob')
      .then(resolve)
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : JSON.stringify(err);
        reject(new Error(`PDF generation failed: ${message}`));
      });
  });

}
