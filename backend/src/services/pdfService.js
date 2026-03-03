const pdfParse = require('pdf-parse');

/**
 * Extracts text content from a PDF buffer, split by page.
 * Returns an array of { order, content } objects.
 */
const extractPagesFromBuffer = async (buffer) => {
  const pages = [];

  let currentPage = 1;
  const pageTexts = {};

  // pdf-parse options: render each page
  const options = {
    pagerender: (pageData) => {
      return pageData.getTextContent().then((textContent) => {
        const text = textContent.items.map((item) => item.str).join(' ');
        pageTexts[pageData.pageNumber] = text;
        return text;
      });
    },
  };

  const data = await pdfParse(buffer, options);

  // If pagerender populated pageTexts, use it; otherwise fall back to splitting full text
  if (Object.keys(pageTexts).length > 0) {
    for (const [pageNum, content] of Object.entries(pageTexts)) {
      pages.push({ order: parseInt(pageNum), content: content.trim() || '[Empty page]' });
    }
    pages.sort((a, b) => a.order - b.order);
  } else {
    // Fallback: split by form feed character (some PDFs use \f as page separator)
    const rawText = data.text || '';
    const rawPages = rawText.split('\f');
    rawPages.forEach((pageText, idx) => {
      pages.push({ order: idx + 1, content: pageText.trim() || '[Empty page]' });
    });
  }

  return { pages, totalPages: data.numpages || pages.length };
};

module.exports = { extractPagesFromBuffer };
