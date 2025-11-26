#!/usr/bin/env node

/**
 * Test PDF Generation - Quick verification script
 * Boss: Testing if jsPDF constructor fixes work
 */

// Import the service that handles PDF generation
const path = require('path')
const fs = require('fs')

// Test both import patterns
console.log('🧪 Testing jsPDF imports...')

// Method 1: VPS Worker style (should work)
try {
  const jsPDF = require('jspdf').jsPDF || require('jspdf')
  console.log('✅ VPS Worker import successful:', typeof jsPDF)
  
  // Quick constructor test
  const testDoc = new jsPDF()
  console.log('✅ jsPDF constructor works!')
  
  // Add some test content
  testDoc.setFontSize(20)
  testDoc.text('PDF Generation Test', 20, 30)
  testDoc.setFontSize(12)
  testDoc.text('This is a test document to verify PDF generation works.', 20, 50)
  testDoc.text('Generated: ' + new Date().toLocaleString(), 20, 70)
  
  // Save test PDF
  const pdfOutput = testDoc.output()
  console.log('✅ PDF generated successfully! Size:', pdfOutput.length, 'bytes')
  
} catch (error) {
  console.error('❌ VPS Worker import failed:', error.message)
}

// Method 2: Destructuring style (old broken way)
try {
  const { jsPDF } = require('jspdf')
  console.log('✅ Destructuring import successful:', typeof jsPDF)
  
  const testDoc2 = new jsPDF()
  console.log('✅ Destructuring constructor works!')
  
} catch (error) {
  console.error('❌ Destructuring import failed:', error.message)
  console.log('ℹ️  This is expected - destructuring doesn\'t work with jsPDF v3+')
}

// Test the actual export service if available
console.log('\n🧪 Testing ExportService...')
try {
  // Mock compiled content for testing
  const testCompiledContent = {
    userInput: {
      book_title: 'Test Book',
      author_name: 'Test Author',
      font_family: 'Arial, sans-serif'
    },
    sections: [
      {
        title: 'Chapter 1: Testing',
        content: 'This is a test chapter content. It should appear in the PDF.',
        chapterNumber: 1
      },
      {
        title: 'Chapter 2: More Testing',
        content: 'This is another test chapter. PDF generation should handle multiple chapters.',
        chapterNumber: 2
      }
    ],
    totalWords: 150
  }
  
  // Check if we're in VPS worker context
  const exportServicePath = path.join(__dirname, 'vps-worker', 'services', 'exportService.js')
  if (fs.existsSync(exportServicePath)) {
    console.log('📁 Found VPS worker export service')
    const ExportService = require('./vps-worker/services/exportService.js')
    const exportService = new ExportService()
    
    console.log('🔄 Testing PDF generation...')
    exportService.generatePDF(testCompiledContent).then(result => {
      console.log('✅ Export service PDF generation successful!')
      console.log('📄 Result type:', typeof result)
    }).catch(error => {
      console.error('❌ Export service PDF generation failed:', error.message)
    })
  } else {
    console.log('ℹ️  VPS worker export service not found in current directory')
  }
  
} catch (error) {
  console.error('❌ ExportService test failed:', error.message)
}

console.log('\n🎯 PDF Generation Test Complete!')
console.log('📋 Summary:')
console.log('   - jsPDF imports: Testing both patterns')  
console.log('   - Constructor test: Verifying "new jsPDF()" works')
console.log('   - Export service: Testing full PDF generation pipeline')
