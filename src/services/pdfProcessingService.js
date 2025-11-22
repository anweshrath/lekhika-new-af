// DYNAMIC PDF PROCESSING SERVICE
// Modular, scalable PDF text extraction and analysis

import * as pdfjsLib from 'pdfjs-dist'

class PDFProcessingService {
  constructor() {
    this.supportedMimeTypes = [
      'application/pdf',
      'application/x-pdf',
      'application/vnd.pdf'
    ]
    this.maxFileSize = 50 * 1024 * 1024 // 50MB for PDFs
    this.workerSrc = null
    this.isInitialized = false
  }

  /**
   * Initialize PDF.js worker
   */
  async initialize() {
    if (this.isInitialized) return

    try {
      // Set up PDF.js worker
      this.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url)
      pdfjsLib.GlobalWorkerOptions.workerSrc = this.workerSrc.href
      this.isInitialized = true
      console.log('✅ PDF Processing Service initialized')
    } catch (error) {
      console.error('❌ Failed to initialize PDF Processing Service:', error)
      throw new Error('PDF processing service initialization failed')
    }
  }

  /**
   * Validate PDF file
   */
  validatePDFFile(file) {
    if (!file) {
      throw new Error('No file provided')
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File size too large. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB.`)
    }

    if (!this.supportedMimeTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Invalid file type. Only PDF files are supported.')
    }

    return true
  }

  /**
   * Extract text from PDF file using PDF.js
   */
  async extractTextFromPDF(file) {
    try {
      await this.initialize()
      
      // Validate file first
      this.validatePDFFile(file)

      console.log(`📄 Processing PDF: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

      // Convert file to ArrayBuffer
      const arrayBuffer = await this.fileToArrayBuffer(file)
      
      // Load PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      let fullText = ''
      const totalPages = pdf.numPages
      
      console.log(`📖 PDF loaded: ${totalPages} pages`)

      // Extract text from each page
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum)
          const textContent = await page.getTextContent()
          
          // Combine text items into page text
          const pageText = textContent.items
            .map(item => item.str)
            .join(' ')
            .trim()
          
          if (pageText) {
            fullText += pageText + '\n\n'
          }
          
          // Progress logging for large PDFs
          if (totalPages > 10 && pageNum % 5 === 0) {
            console.log(`📄 Processed ${pageNum}/${totalPages} pages`)
          }
        } catch (pageError) {
          console.warn(`⚠️ Error processing page ${pageNum}:`, pageError.message)
          // Continue with other pages
        }
      }

      const extractedText = fullText.trim()
      
      if (!extractedText) {
        throw new Error('No text content found in PDF. The PDF might be image-based or corrupted.')
      }

      console.log(`✅ PDF text extraction complete: ${extractedText.length} characters, ${totalPages} pages`)
      
      return {
        text: extractedText,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          totalPages: totalPages,
          extractedLength: extractedText.length,
          extractionMethod: 'pdfjs-dist'
        }
      }

    } catch (error) {
      console.error('❌ PDF text extraction failed:', error)
      throw new Error(`PDF processing failed: ${error.message}`)
    }
  }

  /**
   * Convert File to ArrayBuffer
   */
  async fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = () => reject(new Error('Failed to read PDF file'))
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * Analyze PDF structure and metadata
   */
  async analyzePDFStructure(file) {
    try {
      await this.initialize()
      this.validatePDFFile(file)

      const arrayBuffer = await this.fileToArrayBuffer(file)
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      const metadata = await pdf.getMetadata()
      const info = metadata.info || {}
      
      return {
        title: info.Title || 'Untitled',
        author: info.Author || 'Unknown',
        subject: info.Subject || '',
        creator: info.Creator || '',
        producer: info.Producer || '',
        creationDate: info.CreationDate || '',
        modificationDate: info.ModDate || '',
        pageCount: pdf.numPages,
        fileSize: file.size,
        fileName: file.name
      }
    } catch (error) {
      console.error('❌ PDF structure analysis failed:', error)
      return {
        title: 'Unknown',
        author: 'Unknown',
        pageCount: 0,
        fileSize: file.size,
        fileName: file.name,
        error: error.message
      }
    }
  }

  /**
   * Get PDF page count without full text extraction
   */
  async getPDFPageCount(file) {
    try {
      await this.initialize()
      this.validatePDFFile(file)

      const arrayBuffer = await this.fileToArrayBuffer(file)
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      return pdf.numPages
    } catch (error) {
      console.error('❌ Failed to get PDF page count:', error)
      return 0
    }
  }

  /**
   * Extract text from specific pages
   */
  async extractTextFromPages(file, pageNumbers = []) {
    try {
      await this.initialize()
      this.validatePDFFile(file)

      const arrayBuffer = await this.fileToArrayBuffer(file)
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      let extractedText = ''
      const totalPages = pdf.numPages
      
      // Validate page numbers
      const validPages = pageNumbers.filter(pageNum => 
        Number.isInteger(pageNum) && pageNum >= 1 && pageNum <= totalPages
      )
      
      if (validPages.length === 0) {
        throw new Error(`Invalid page numbers. PDF has ${totalPages} pages.`)
      }

      for (const pageNum of validPages) {
        try {
          const page = await pdf.getPage(pageNum)
          const textContent = await page.getTextContent()
          
          const pageText = textContent.items
            .map(item => item.str)
            .join(' ')
            .trim()
          
          if (pageText) {
            extractedText += `[Page ${pageNum}]\n${pageText}\n\n`
          }
        } catch (pageError) {
          console.warn(`⚠️ Error processing page ${pageNum}:`, pageError.message)
        }
      }

      return {
        text: extractedText.trim(),
        metadata: {
          fileName: file.name,
          extractedPages: validPages,
          totalPages: totalPages,
          extractionMethod: 'pdfjs-dist-selective'
        }
      }

    } catch (error) {
      console.error('❌ Selective PDF text extraction failed:', error)
      throw new Error(`Selective PDF processing failed: ${error.message}`)
    }
  }

  /**
   * Check if PDF is image-based (scanned document)
   */
  async isImageBasedPDF(file) {
    try {
      await this.initialize()
      this.validatePDFFile(file)

      const arrayBuffer = await this.fileToArrayBuffer(file)
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      // Check first few pages for text content
      const pagesToCheck = Math.min(3, pdf.numPages)
      let textFound = false
      
      for (let pageNum = 1; pageNum <= pagesToCheck; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        if (textContent.items.length > 0) {
          const hasText = textContent.items.some(item => item.str.trim().length > 0)
          if (hasText) {
            textFound = true
            break
          }
        }
      }
      
      return !textFound // If no text found, it's likely image-based
    } catch (error) {
      console.error('❌ Failed to check if PDF is image-based:', error)
      return false
    }
  }
}

// Export singleton instance
export const pdfProcessingService = new PDFProcessingService()
export default pdfProcessingService
