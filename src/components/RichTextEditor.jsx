import React from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

// Enhanced CSS for better contrast and visibility
const editorStyles = `
  .ql-toolbar {
    background: #1f2937 !important;
    border: 1px solid #374151 !important;
    border-radius: 8px 8px 0 0 !important;
    padding: 12px !important;
  }
  
  .ql-toolbar .ql-stroke {
    stroke: #d1d5db !important;
  }
  
  .ql-toolbar .ql-fill {
    fill: #d1d5db !important;
  }
  
  .ql-toolbar .ql-picker-label {
    color: #d1d5db !important;
  }
  
  .ql-toolbar .ql-picker-options {
    background: #1f2937 !important;
    border: 1px solid #374151 !important;
    color: #d1d5db !important;
  }
  
  .ql-toolbar button:hover {
    background: #374151 !important;
    border-radius: 4px !important;
  }
  
  .ql-toolbar button.ql-active {
    background: #3b82f6 !important;
    color: white !important;
  }
  
  .ql-container {
    background: #111827 !important;
    border: 1px solid #374151 !important;
    border-radius: 0 0 8px 8px !important;
    color: #f9fafb !important;
  }
  
  .ql-editor {
    color: #f9fafb !important;
    font-family: 'Inter', sans-serif !important;
    line-height: 1.6 !important;
  }
  
  .ql-editor.ql-blank::before {
    color: #6b7280 !important;
    font-style: normal !important;
  }
  
  .ql-editor h1, .ql-editor h2, .ql-editor h3 {
    color: #f9fafb !important;
  }
  
  .ql-editor strong {
    color: #fbbf24 !important;
    font-weight: 700 !important;
  }
  
  .ql-editor em {
    color: #a78bfa !important;
  }
`

const RichTextEditor = ({ 
  value = '', 
  onChange, 
  placeholder = 'Enter content...',
  height = 300,
  className = '',
  disabled = false
}) => {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ],
  }

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'align', 'link', 'blockquote', 'code-block'
  ]

  // Clean HTML content for ReactQuill
  const cleanHtmlContent = (content) => {
    if (!content) return ''
    
    // If it's already clean HTML, return as is
    if (typeof content === 'string' && content.includes('<')) {
      return content
    }
    
    // If it's plain text, convert to proper HTML formatting
    if (typeof content === 'string') {
      return content
        .replace(/\n\n+/g, '</p><p>')  // Double line breaks = new paragraph
        .replace(/\n/g, '<br>')        // Single line breaks = line breaks
        .replace(/^(.*)$/, '<p>$1</p>') // Wrap in paragraph
        .replace(/<p><\/p>/g, '')       // Remove empty paragraphs
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>')             // Italic
        .replace(/# (.*?)(?=\n|$)/g, '<h1>$1</h1>')       // H1 headers
        .replace(/## (.*?)(?=\n|$)/g, '<h2>$1</h2>')      // H2 headers
        .replace(/### (.*?)(?=\n|$)/g, '<h3>$1</h3>')     // H3 headers
    }
    
    return content
  }

  return (
    <>
      <style>{editorStyles}</style>
      <div className={`rich-text-editor ${className}`} style={{ height: height + 'px' }}>
        <ReactQuill
          theme="snow"
          value={cleanHtmlContent(value)}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          style={{ 
            height: (height - 42) + 'px',
            backgroundColor: '#374151',
            color: '#e5e7eb'
          }}
        />
      </div>
    </>
  )
}

export default RichTextEditor
