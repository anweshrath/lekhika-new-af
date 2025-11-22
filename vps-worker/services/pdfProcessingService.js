// DYNAMIC PDF PROCESSING SERVICE - NODE.JS STUB
// PDF processing is for OUTPUT only (handled by exportService)
// This stub prevents module loading errors

class PDFProcessingService {
  constructor() {
    this.supportedMimeTypes = ['application/pdf']
    this.isInitialized = false
  }

  async initialize() {
    this.isInitialized = true
    console.log('✅ PDF Processing Service initialized (stub for Node.js)')
  }

  async extractText(file) {
    throw new Error('PDF text extraction not needed in server-side workflow execution')
  }

  async extractMetadata(file) {
    return {
      title: '',
      author: '',
      subject: '',
      keywords: '',
      creator: '',
      producer: '',
      creationDate: null,
      modificationDate: null
    }
  }

  async getPageCount(file) {
    return 0
  }

  async extractTextByPage(file, pageNumber) {
    return ''
  }

  async validatePDF(file) {
    return false
  }

  fileToArrayBuffer(file) {
    return Promise.resolve(new ArrayBuffer(0))
  }
}

const pdfProcessingService = new PDFProcessingService()

module.exports = { pdfProcessingService }
