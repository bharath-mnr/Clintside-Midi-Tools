import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Download, X, ChevronDown, Loader2, CheckCircle, Zap, Image, FileSearch, AlertCircle } from 'lucide-react';

// Main App component for the PDF to Image Converter
const PdfToImageConverter = () => {
  // State variables to manage the application's UI and data
  const [selectedFiles, setSelectedFiles] = useState([]); // Stores PDF files selected by the user
  const [generateAs, setGenerateAs] = useState('jpg'); // Stores the desired output image format (jpg or png)
  const [isProcessing, setIsProcessing] = useState(false); // Indicates if conversion is in progress
  const [processedFiles, setProcessedFiles] = useState([]); // Stores the results of processed PDF files (generated images)
  const [showDropdown, setShowDropdown] = useState(false); // Controls the visibility of the format dropdown
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false); // Tracks if the PDF.js library has been loaded
  const [error, setError] = useState(null); // Stores any error messages to display
  const [quality, setQuality] = useState(1.5); // DPI scale factor for image quality (higher value = higher quality/larger file)
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0, currentFile: '' }); // Progress tracking
  const [isDragging, setIsDragging] = useState(false); // Track drag state for visual feedback
  const [isZipping, setIsZipping] = useState(false); // New state for ZIP creation progress

  // Refs for direct DOM interaction
  const fileInputRef = useRef(null); // Ref for the hidden file input element
  const dropdownRef = useRef(null); // Ref for the format dropdown element to detect clicks outside

  // Available output formats for images
  const formats = [
    { value: 'jpg', label: 'JPEG Image (.jpg)' },
    { value: 'png', label: 'PNG Image (.png)' },
  ];

  // Effect to load PDF.js library dynamically
  useEffect(() => {
    const loadPdfLib = async () => {
      try {
        // Check if PDF.js is already loaded
        if (window.pdfjsLib) {
          setPdfLibLoaded(true);
          return;
        }

        // Create and append the PDF.js script to the document head
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          // Once PDF.js is loaded, set its worker source and update state
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            setPdfLibLoaded(true);
          }
        };
        script.onerror = () => setError('Failed to load PDF processing library. Please check your internet connection.'); // Handle script loading errors
        document.head.appendChild(script);
      } catch (err) {
        setError('Failed to initialize PDF processing. An unexpected error occurred.'); // Catch any other initialization errors
      }
    };

    loadPdfLib(); // Call the function to load the library when the component mounts
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to load JSZip library dynamically
  useEffect(() => {
    const loadJSZipLib = () => {
      if (window.JSZip) return; // Already loaded

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = () => console.log('JSZip loaded successfully');
      script.onerror = () => console.error('Failed to load JSZip library.');
      document.head.appendChild(script);
    };

    loadJSZipLib();
  }, []);

  // Effect to close the dropdown when a click occurs outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the dropdown ref exists and the click is outside the dropdown, close it
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    // Add event listener for mousedown on the document
    document.addEventListener('mousedown', handleClickOutside);
    // Cleanup function to remove the event listener when the component unmounts
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handles file selection, either from input or drag-and-drop
  const handleFileSelect = (files) => {
    // Filter for only PDF files and add them to the selected files state
    const newFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    const nonPdfFiles = Array.from(files).filter(file => file.type !== 'application/pdf');
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
    setError(null); // Clear any previous errors
    setProcessedFiles([]); // Clear processed files when new files are selected
    
    // Show helpful message if non-PDF files were selected
    if (nonPdfFiles.length > 0) {
      setError(`${nonPdfFiles.length} non-PDF file(s) were skipped. Only PDF files are supported.`);
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
    }
  };

  // Enhanced drag handlers with visual feedback
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Handles files dropped into the drag-and-drop area
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files); // Pass the dropped files to the file selection handler
    }
  };

  // Removes a selected file from the list based on its index
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Formats file size into a human-readable string (e.g., 1.23 MB)
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Core PDF processing function using PDF.js to convert a single PDF file to images
  const processPdfToImages = async (pdfFile, format) => {
    // Ensure PDF.js library is loaded before proceeding
    if (!window.pdfjsLib) {
      throw new Error('PDF.js library not loaded. Please wait or refresh.');
    }

    // Read the PDF file as an ArrayBuffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    // Get the PDF document object from PDF.js
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    // Extract the file name without extension for naming generated images
    const nameWithoutExtension = pdfFile.name.substring(0, pdfFile.name.lastIndexOf('.')) || pdfFile.name;
    const generatedImages = [];

    // Update progress
    setProcessingProgress(prev => ({ ...prev, currentFile: pdfFile.name }));

    // Iterate through each page of the PDF
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        // Scale the viewport based on the quality setting (DPI factor)
        const viewport = page.getViewport({ scale: quality });
        
        // Create a canvas element to render the PDF page
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Define the render context for PDF.js
        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        // Render PDF page to the canvas
        await page.render(renderContext).promise;

        // Convert canvas content to a Blob (image file)
        const blob = await new Promise((resolve) => {
          // Use appropriate MIME type and quality for JPEG/PNG
          canvas.toBlob(resolve, `image/${format}`, format === 'jpg' ? 0.92 : 1.0);
        });

        // Create a unique name for the generated image file
        const generatedName = `${nameWithoutExtension}-page-${pageNum}.${format}`;
        generatedImages.push({
          name: generatedName,
          size: blob.size,
          blob: blob,
          downloadUrl: URL.createObjectURL(blob), // Create a URL for direct download
          pageNumber: pageNum
        });
      } catch (pageError) {
        console.error(`Error processing page ${pageNum} of ${pdfFile.name}:`, pageError);
        // Continue with other pages even if one fails to ensure partial results are shown
        setError(`Could not convert page ${pageNum} of ${pdfFile.name}. Some pages might be corrupted.`);
      }
    }

    // Return an object containing information about the original PDF and its generated images
    return {
      originalPdfName: pdfFile.name,
      totalPages: pdf.numPages,
      images: generatedImages
    };
  };

  // Initiates the conversion process for all selected PDF files
  const startProcessing = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select PDF files to convert.');
      return;
    }
    if (!pdfLibLoaded) {
      setError('PDF processing library is still loading. Please wait and try again.');
      return;
    }
    
    setIsProcessing(true); // Set processing state to true
    setError(null); // Clear any existing errors
    setProcessingProgress({ current: 0, total: selectedFiles.length, currentFile: '' });
    
    // Clean up old object URLs from previous conversions to prevent memory leaks
    processedFiles.forEach(pdfResult => 
      pdfResult.images.forEach(image => URL.revokeObjectURL(image.downloadUrl))
    );
    setProcessedFiles([]); // Clear previous results before starting new conversion

    const tempProcessedResults = []; // Temporary array to hold results during processing
    
    // Process each selected PDF file sequentially
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setProcessingProgress(prev => ({ ...prev, current: i + 1 }));
      
      try {
        if (file.type === 'application/pdf') {
          // Check file size and page limits
          const MAX_FILE_SIZE_MB = 30; // 30 MB
          const MAX_PAGES = 50; // 50 pages

          if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setError(`File "${file.name}" exceeds the maximum size of ${MAX_FILE_SIZE_MB}MB.`);
            setIsProcessing(false);
            return;
          }

          // A small optimization: load PDF to check page count before full conversion
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          if (pdf.numPages > MAX_PAGES) {
            setError(`File "${file.name}" has ${pdf.numPages} pages, exceeding the maximum of ${MAX_PAGES} pages.`);
            setIsProcessing(false);
            return;
          }
          
          const result = await processPdfToImages(file, generateAs);
          tempProcessedResults.push(result);
          setProcessedFiles([...tempProcessedResults]); // Update state incrementally to show progress
        } else {
          console.warn(`Skipping non-PDF file: ${file.name}`);
        }
      } catch (error) {
        console.error("Error processing file:", file.name, error);
        setError(`Error processing ${file.name}: ${error.message || 'An unknown error occurred.'}`);
      }
    }
    
    setIsProcessing(false); // Set processing state to false once all files are done
    setProcessingProgress({ current: 0, total: 0, currentFile: '' });
  };

  // Triggers the download for a single image file
  const downloadImageFile = (imageFile) => {
    const link = document.createElement('a'); // Create a temporary anchor element
    link.href = imageFile.downloadUrl; // Set its href to the image's download URL
    link.download = imageFile.name; // Set the download attribute to the desired file name
    document.body.appendChild(link); // Append the link to the document body
    link.click(); // Programmatically click the link to trigger download
    document.body.removeChild(link); // Remove the link from the document body
  };

  // Download all images as a zip file
  const downloadAllImages = async () => {
    if (!window.JSZip) {
      setError('ZIP library not loaded. Please wait or refresh.');
      return;
    }
    if (processedFiles.length === 0) {
      setError('No images to download.');
      return;
    }

    setIsZipping(true);
    setError(null);
    const zip = new window.JSZip();
    let imageCount = 0;

    processedFiles.forEach(pdfResult => {
      pdfResult.images.forEach(image => {
        // Use a unique path for each file in the zip, handling potential duplicate names
        // For example, "original_pdf_name/image_name.jpg"
        const folderName = pdfResult.originalPdfName.replace(/\.pdf$/i, ''); // Remove .pdf extension
        const fileName = image.name;
        zip.file(`${folderName}/${fileName}`, image.blob);
        imageCount++;
      });
    });

    try {
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipFileName = `converted_images_${Date.now()}.zip`;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href); // Clean up the object URL
    } catch (zipError) {
      console.error("Error zipping files:", zipError);
      setError(`Failed to create ZIP file: ${zipError.message || 'An unknown error occurred.'}`);
    } finally {
      setIsZipping(false);
    }
  };

  // Resets the application state to its initial upload view
  const reset = () => {
    // Revoke all object URLs to free up memory used by generated images
    processedFiles.forEach(pdfResult => 
      pdfResult.images.forEach(image => URL.revokeObjectURL(image.downloadUrl))
    );
    setSelectedFiles([]); // Clear selected PDF files
    setProcessedFiles([]); // Clear processed image results
    setIsProcessing(false); // Reset processing state
    setError(null); // Clear any error messages
    setProcessingProgress({ current: 0, total: 0, currentFile: '' });
  };

  // Auto-dismiss error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Find the currently selected format object for display
  const selectedFormat = formats.find(f => f.value === generateAs);

  // Conditional rendering flags to control which sections are visible
  const showInitialUploadArea = selectedFiles.length === 0 && processedFiles.length === 0;
  const showSelectedFilesArea = selectedFiles.length > 0 && processedFiles.length === 0;
  const showProcessedResultsArea = processedFiles.length > 0;

  // Calculate total images generated
  const totalImages = processedFiles.reduce((sum, pdfResult) => sum + pdfResult.images.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col items-center justify-start py-10 px-4">
      <main className="max-w-5xl w-full">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
            PDF to Image Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Convert your PDF files into high-quality JPG or PNG images instantly.
          </p>
          {/* Loading indicator for PDF.js library */}
          {!pdfLibLoaded && (
            <div className="mt-4 flex items-center justify-center text-rose-600 space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading PDF processing library...</span>
            </div>
          )}
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-300 rounded-xl p-4 flex items-center justify-between shadow-sm animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Processing Progress Bar */}
        {isProcessing && (
          <div className="mb-6 bg-rose-100 border border-rose-300 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-rose-800 font-medium">Processing...</span>
              <span className="text-rose-600 text-sm">
                {processingProgress.current} of {processingProgress.total} files
              </span>
            </div>
            <div className="w-full bg-rose-200 rounded-full h-2 mb-2">
              <div 
                className="bg-rose-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(processingProgress.current / processingProgress.total) * 100}%` }}
              ></div>
            </div>
            {processingProgress.currentFile && (
              <p className="text-rose-700 text-sm">
                Current: {processingProgress.currentFile}
              </p>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 space-y-8 border border-gray-100">
          {/* Section 1: Choose Output Format & Quality */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              1. Choose Output Format & Quality
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Format Dropdown */}
              <div className="relative flex-1" ref={dropdownRef}>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Output Format
                </label>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-left flex items-center justify-between hover:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all shadow-sm"
                >
                  <span className="font-medium text-gray-800">
                    {selectedFormat.label}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showDropdown && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                    {formats.map((format) => (
                      <button
                        key={format.value}
                        onClick={() => {
                          setGenerateAs(format.value);
                          setShowDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left transition-colors ${
                          generateAs === format.value 
                            ? 'bg-rose-50 text-rose-700 font-medium' 
                            : 'text-gray-700 hover:bg-rose-50 hover:text-rose-700'
                        }`}
                      >
                        {format.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quality Range Slider */}
              <div className="flex-1">
                <label htmlFor="quality-slider" className="text-sm font-medium text-gray-700 mb-2 block">
                  Quality Scale: {quality}x
                </label>
                <input
                  id="quality-slider"
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg bg-gray-200 accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low (0.5x)</span>
                  <span>High (3x)</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Upload Area (Conditional Display) */}
          {showInitialUploadArea && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                2. Upload Your PDF Files
              </h2>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragging 
                    ? 'border-rose-500 bg-rose-50 scale-105' 
                    : 'border-gray-300 hover:border-rose-500 hover:bg-rose-50'
                }`}
              >
                <FileSearch className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                  isDragging ? 'text-rose-600' : 'text-rose-500'
                }`} />
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  {isDragging ? 'Drop your PDF files here' : 'Drop PDF files here or click to upload'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Only .pdf files are supported. Max 30MB, 50 pages per file.
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  <Upload className="w-4 h-4" />
                  Click or drag & drop
                </div>
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

          {/* Section 2: Selected Files Area (Conditional Display) */}
          {showSelectedFilesArea && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                2. Selected PDF Files
              </h2>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-medium text-gray-800">
                    {selectedFiles.length} PDF{selectedFiles.length !== 1 ? 's' : ''} selected
                  </p>
                  <button 
                    onClick={reset} 
                    className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-200 transition-colors"
                    title="Clear all files"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="w-5 h-5 text-rose-500 flex-shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-sm text-gray-800 truncate font-medium" title={file.name}>{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFile(index)} 
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                        title="Remove file"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    onClick={startProcessing}
                    disabled={isProcessing || !pdfLibLoaded || selectedFiles.length === 0}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Converting...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Convert to {selectedFormat.value.toUpperCase()}</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    This may take a moment depending on file size and page count
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Section 2: Conversion Result Area (Conditional Display) */}
          {showProcessedResultsArea && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                2. Conversion Results
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-green-800 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Conversion Complete! ({totalImages} images generated)
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={downloadAllImages}
                      disabled={isZipping} // Disable button during zipping
                      className="bg-green-600 text-white text-sm font-medium px-3 py-1.5 rounded-xl hover:bg-green-700 transition-colors shadow-md flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isZipping ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Zipping...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download All (ZIP)
                        </>
                      )}
                    </button>
                    <button
                      onClick={reset}
                      className="bg-rose-600 text-white text-sm font-medium px-3 py-1.5 rounded-xl hover:bg-rose-700 transition-colors shadow-md"
                    >
                      Convert More
                    </button>
                  </div>
                </div>
                <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                  {processedFiles.map((pdfResult, pdfIndex) => (
                    <div key={pdfIndex} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-medium text-gray-900">
                          {pdfResult.originalPdfName}
                        </p>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {pdfResult.images.length} of {pdfResult.totalPages} pages
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {pdfResult.images.map((image, imageIndex) => (
                          <div key={imageIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col items-center group shadow-sm hover:shadow-md transition-all hover:scale-105">
                            <Image className="w-8 h-8 text-purple-600 mb-2" />
                            <p className="text-sm text-gray-800 truncate w-full text-center font-medium" title={image.name}>
                              Page {image.pageNumber}
                            </p>
                            <p className="text-xs text-gray-500 mb-3">{formatFileSize(image.size)}</p>
                            <button
                              onClick={() => downloadImageFile(image)}
                              className="w-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-1.5 rounded-xl flex items-center justify-center gap-1 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          </div>
                        ))}
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

export default PdfToImageConverter;
