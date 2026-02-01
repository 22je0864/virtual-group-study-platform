const fs = require("fs");
const path = require("path");

async function extractPdfText(filePath) {
  try {
    // Resolve absolute path
    const absPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(__dirname, "..", filePath);

    // Check file exists
    if (!fs.existsSync(absPath)) {
      throw new Error(`FILE_NOT_FOUND: ${absPath}`);
    }

    // Read PDF buffer
    const buffer = fs.readFileSync(absPath);
    
    // ✅ Convert Buffer to Uint8Array (THIS IS THE KEY FIX)
    const uint8Array = new Uint8Array(buffer);

    // Load pdfjs-dist
    const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

    // Load PDF document with Uint8Array
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,  // ✅ Use Uint8Array instead of buffer
      useSystemFonts: true,
      verbosity: 0  // Reduce warnings
    });

    const pdfDocument = await loadingTask.promise;
    
    let fullText = "";

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(" ");
      fullText += pageText + "\n";
    }

    console.log("✅ PDF text extracted successfully");
    return fullText.trim();
    
  } catch (error) {
    console.error("PDF extraction error:", error.message);
    throw error;
  }
}

module.exports = { extractPdfText };
