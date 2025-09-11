import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Download, X, Loader2, AlertCircle, ClipboardCopy } from 'lucide-react';

const PdfToTextConverter = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]); // Stores { originalPdfName, textContent, downloadUrl }
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // OCR specific states and ref
  const [ocrEnabled, setOcrEnabled] = useState(false);
  const ocrWorkerRef = useRef(null); // Ref to store the Tesseract.js worker instance
  const [ocrInitialized, setOcrInitialized] = useState(false); // Tracks if Tesseract worker is ready

  // Define Limits
  const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
  const MAX_PAGES = 500; // 500 pages

  // Load PDF.js library
  useEffect(() => {
    const loadPdfLib = async () => {
      try {
        // Check if PDF.js is already loaded
        if (window.pdfjsLib) {
          setPdfLibLoaded(true);
          return;
        }

        // Load PDF.js from CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          if (window.pdfjsLib) {
            // Set worker source for PDF.js
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            setPdfLibLoaded(true);
          }
        };
        script.onerror = () => setError('Failed to load PDF processing library. Please check your internet connection.');
        document.head.appendChild(script);
      } catch (err) {
        setError('Failed to initialize PDF processing.');
      }
    };

    loadPdfLib();
  }, []);

  // Load and initialize Tesseract.js (OCR library)
  useEffect(() => {
    // If OCR is enabled and the worker is not yet initialized
    if (ocrEnabled && !ocrWorkerRef.current) {
      const initializeOcrWorker = async () => {
        try {
          // Load Tesseract.js script if not already present
          if (!window.Tesseract) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.3/dist/tesseract.min.js';
            script.onload = async () => {
              if (window.Tesseract) {
                console.log('Tesseract.js loaded. Initializing worker...');
                const worker = await window.Tesseract.createWorker('eng', 1, { logger: m => { /* console.log('Tesseract progress:', m); */ } });
                ocrWorkerRef.current = worker;
                setOcrInitialized(true);
                console.log('Tesseract worker initialized.');
              }
            };
            script.onerror = () => setError('Failed to load OCR library. Please check your internet connection.');
            document.head.appendChild(script);
          } else {
            // Tesseract.js is already loaded, just create the worker
            console.log('Tesseract.js already loaded. Initializing worker...');
            const worker = await window.Tesseract.createWorker('eng', 1, { logger: m => { /* console.log('Tesseract progress:', m); */ } });
            ocrWorkerRef.current = worker;
            setOcrInitialized(true);
            console.log('Tesseract worker initialized.');
          }
        } catch (err) {
          setError('Failed to initialize OCR processing.');
          console.error('OCR initialization error:', err);
        }
      };
      initializeOcrWorker();
    } else if (!ocrEnabled && ocrWorkerRef.current) {
      // If OCR is disabled and a worker exists, terminate it
      console.log('Terminating OCR worker...');
      ocrWorkerRef.current.terminate();
      ocrWorkerRef.current = null;
      setOcrInitialized(false);
    }

    // Cleanup worker on component unmount
    return () => {
      if (ocrWorkerRef.current) {
        console.log('Terminating OCR worker on unmount...');
        ocrWorkerRef.current.terminate();
        ocrWorkerRef.current = null;
        setOcrInitialized(false);
      }
    };
  }, [ocrEnabled]); // Only re-run this effect when ocrEnabled changes

  // Handles file selection from input or drag-and-drop
  const handleFileSelect = (files) => {
    let newFiles = [];
    let hasError = false;
    let errorMessage = '';

    Array.from(files).forEach(file => {
      if (file.type !== 'application/pdf') {
        errorMessage = 'Only PDF files are supported. Please upload .pdf files.';
        hasError = true;
      } else if (file.size > MAX_FILE_SIZE_BYTES) {
        errorMessage = `File "${file.name}" exceeds the maximum size of ${formatFileSize(MAX_FILE_SIZE_BYTES)}.`;
        hasError = true;
      } else {
        newFiles.push(file);
      }
    });

    if (hasError) {
      setError(errorMessage);
    } else {
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setError(null); // Clear any previous errors
      setProcessedFiles([]); // Clear processed files when new files are selected
    }
  };

  // Prevent default drag behavior
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle files dropped into the drag-and-drop area
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  // Remove a selected file from the list
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Core PDF text extraction function using PDF.js and optionally Tesseract.js (OCR)
  const extractTextFromPdf = async (pdfFile) => {
    if (!window.pdfjsLib) {
      throw new Error('PDF.js library not loaded.');
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    // Check page limit
    if (pdf.numPages > MAX_PAGES) {
      throw new Error(`PDF "${pdfFile.name}" exceeds the maximum page limit of ${MAX_PAGES} pages.`);
    }

    let fullText = '';

    // Iterate through each page of the PDF and extract text
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');

        // Heuristic: If PDF.js extracts very little text, consider it a scanned page
        // and attempt OCR if enabled. The threshold (e.g., < 50 characters) can be adjusted.
        if (ocrEnabled && ocrWorkerRef.current && pageText.trim().length < 50) {
          console.log(`Page ${pageNum} of ${pdfFile.name} appears scanned. Attempting OCR...`);
          // Render page to a canvas for OCR
          const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR accuracy
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
          };
          await page.render(renderContext).promise;

          // Perform OCR using Tesseract.js worker
          const { data: { text } } = await ocrWorkerRef.current.recognize(canvas);
          fullText += text + '\n\n'; // Append OCR'd text
        } else {
          fullText += pageText + '\n\n'; // Append text extracted by PDF.js
        }
      } catch (pageError) {
        console.error(`Error extracting text from page ${pageNum} of ${pdfFile.name}:`, pageError);
        // Continue with other pages even if one fails, adding an error placeholder
        fullText += `[Error extracting text from page ${pageNum}]\n\n`;
      }
    }

    // Create a Blob for the extracted text content
    const textBlob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });

    return {
      originalPdfName: pdfFile.name,
      textContent: fullText,
      size: textBlob.size,
      downloadUrl: URL.createObjectURL(textBlob), // Create URL for direct download
      totalPages: pdf.numPages
    };
  };

  // Start the conversion process for all selected PDF files
  const startProcessing = async () => {
    if (selectedFiles.length === 0) return;
    if (!pdfLibLoaded) {
      setError('PDF processing library is still loading. Please wait and try again.');
      return;
    }
    // If OCR is enabled, ensure the Tesseract worker is initialized
    if (ocrEnabled && !ocrInitialized) {
      setError('OCR engine is still loading or failed to initialize. Please wait and try again.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    // Clean up old object URLs to prevent memory leaks
    processedFiles.forEach(pdfResult => URL.revokeObjectURL(pdfResult.downloadUrl));
    setProcessedFiles([]); // Clear previous results

    const tempProcessedResults = [];
    
    // Process each selected PDF file
    for (const file of selectedFiles) {
      try {
        if (file.type === 'application/pdf') {
          const result = await extractTextFromPdf(file);
          tempProcessedResults.push(result);
          setProcessedFiles([...tempProcessedResults]); // Update state incrementally to show progress
        } else {
          console.warn(`Skipping non-PDF file: ${file.name}`);
        }
      } catch (processingError) {
        console.error("Error processing file:", file.name, processingError);
        setError(`Error processing ${file.name}: ${processingError.message}`);
        // If an error occurs, stop processing further files for this batch
        setIsProcessing(false); 
        return; 
      }
    }
    
    setIsProcessing(false);
  };

  // Trigger download for a single text file
  const downloadTextFile = (processedFile) => {
    const link = document.createElement('a');
    link.href = processedFile.downloadUrl;
    const nameWithoutExtension = processedFile.originalPdfName.substring(0, processedFile.originalPdfName.lastIndexOf('.')) || processedFile.originalPdfName;
    link.download = `${nameWithoutExtension}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy text content to clipboard
  const copyTextToClipboard = (text) => {
    // Using document.execCommand('copy') as navigator.clipboard.writeText() might be restricted in iframes
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; // Avoid scrolling to bottom
    textarea.style.opacity = 0; // Hide it
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      // Optionally, provide user feedback (e.g., a temporary "Copied!" message)
      console.log('Text copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text:', err);
      setError('Failed to copy text to clipboard. Please try again or download the file.');
    } finally {
      document.body.removeChild(textarea);
    }
  };

  // Reset the application state to initial upload view
  const reset = () => {
    // Revoke all object URLs to free up memory
    processedFiles.forEach(pdfResult => URL.revokeObjectURL(pdfResult.downloadUrl));
    setSelectedFiles([]);
    setProcessedFiles([]);
    setIsProcessing(false);
    setError(null);
  };

  // Conditional rendering flags
  const showInitialUploadArea = selectedFiles.length === 0 && processedFiles.length === 0;
  const showSelectedFilesArea = selectedFiles.length > 0 && processedFiles.length === 0;
  const showProcessedResultsArea = processedFiles.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col items-center justify-start py-10 px-4">
      <main className="max-w-5xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
            PDF to Text Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Extract plain text from your PDF files quickly and accurately.
          </p>
          {!pdfLibLoaded && (
            <div className="mt-4 flex items-center justify-center text-rose-600 space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading PDF processing library...</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-300 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <div className="bg-white shadow-2xl rounded-2xl p-6 md:p-8 space-y-8 border border-gray-200">
          {/* OCR Toggle Section */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              1. Text Extraction Options
            </h2>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ocrToggle"
                  checked={ocrEnabled}
                  onChange={(e) => setOcrEnabled(e.target.checked)}
                  className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                />
                <label htmlFor="ocrToggle" className="ml-2 block text-base font-medium text-gray-700">
                  Enable text extraction from images within PDF (for scanned documents)
                </label>
              </div>
              {ocrEnabled && !ocrInitialized && (
                <p className="text-sm text-rose-600 mt-2 flex items-center">
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Loading text recognition engine... This may take a moment.
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Turn this on if your PDF contains images of text (like scanned documents or photos of text) and you want to extract that text.
              </p>
            </div>
          </section>

          {/* Upload Area */}
          {showInitialUploadArea && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                2. Upload Your PDF Files
              </h2>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-rose-500 hover:bg-rose-50 transition-all"
              >
                <Upload className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">
                  Drop PDF files here or click to upload
                </h3>
                <p className="text-sm text-gray-500">
                  Only .pdf files are supported. Max file size: {formatFileSize(MAX_FILE_SIZE_BYTES)}. Max pages: {MAX_PAGES}.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </div>
            </section>
          )}

          {/* Selected Files */}
          {showSelectedFilesArea && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                2. Selected PDF Files
              </h2>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-medium text-gray-800">
                    Selected PDFs ({selectedFiles.length})
                  </p>
                  <button onClick={reset} title="Clear all files" className="p-1 rounded-full hover:bg-gray-200">
                    <X className="w-5 h-5 text-red-500 hover:text-red-700" />
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex justify-between items-center bg-white px-3 py-2 rounded border border-gray-200">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-rose-500" />
                        <div className="overflow-hidden">
                          <p className="text-sm text-gray-800 truncate" title={file.name}>{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button onClick={() => removeFile(index)} className="p-1 rounded-full hover:bg-gray-100">
                        <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <button
                    onClick={startProcessing}
                    disabled={isProcessing || !pdfLibLoaded || (ocrEnabled && !ocrInitialized)}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-lg flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{ocrEnabled ? 'Extracting Text (with image recognition)...' : 'Extracting Text...'}</span>
                      </>
                    ) : (
                      <span>{ocrEnabled ? 'Extract Text (with image recognition)' : 'Extract Text'}</span>
                    )}
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Conversion Result */}
          {showProcessedResultsArea && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                3. Extracted Text Results
              </h2>
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-rose-800 font-semibold">Text Extraction Complete!</h3>
                  <button
                    onClick={reset}
                    className="bg-rose-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    Convert More PDFs
                  </button>
                </div>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {processedFiles.map((pdfResult, pdfIndex) => (
                    <div key={pdfIndex} className="bg-white rounded-md border p-3">
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        {pdfResult.originalPdfName} ({pdfResult.totalPages} pages processed)
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => downloadTextFile(pdfResult)}
                          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-1.5 rounded-md flex items-center justify-center gap-1 transition-transform transform hover:scale-[1.02]"
                        >
                          <Download className="w-4 h-4" />
                          Download .txt
                        </button>
                        <button
                          onClick={() => copyTextToClipboard(pdfResult.textContent)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-1.5 rounded-md flex items-center justify-center gap-1 transition-transform transform hover:scale-[1.02]"
                        >
                          <ClipboardCopy className="w-4 h-4" />
                          Copy Text
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default PdfToTextConverter;