/**
 * Client-side PDF text extraction utility using react-pdf / pdfjs-dist.
 * Lazily loads PDF.js to avoid bundle bloat and SSR / evaluation conflicts.
 */

export async function pdfToText(file: File | Blob): Promise<string> {
  const { pdfjs } = await import('react-pdf');

  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
  let extractedText = '';

  try {
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');
      if (pageText.trim()) {
        extractedText += (extractedText ? '\n\n' : '') + pageText;
      }
    }
  } catch (error) {
    console.error('Failed to extract text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error}`);
  } finally {
    loadingTask.destroy();
  }

  return extractedText;
}

export default pdfToText;
