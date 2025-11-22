import { dbService } from './database';

const MIME_TYPES = {
  pdf: 'application/pdf',
  epub: 'application/epub+zip',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  html: 'text/html',
  md: 'text/markdown',
  markdown: 'text/markdown',
  txt: 'text/plain',
  json: 'application/json',
};

const BUFFER_LIKE_KEYS = new Set(['pdf', 'docx', 'epub']);

// SURGICAL FIX:
// Normalize format labels (including human-readable ones) to real extension keys.
const FORMAT_ALIASES = {
  text: 'txt',
  plaintext: 'txt',
  'plain_text': 'txt',
  'plain-text': 'txt',
  'plain text': 'txt',
  htm: 'html',
  htr: 'html',
  'pdf_document': 'pdf',
  'pdf document': 'pdf'
};

const ALLOWED_FORMATS = new Set(['pdf', 'epub', 'docx', 'html', 'md', 'markdown', 'txt', 'json']);

const normalizeFormat = (format) => {
  const base = String(format || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_');

  const mapped = FORMAT_ALIASES[base] || base;
  return mapped;
};

const sanitizeFilenamePart = (value) =>
  String(value || 'untitled')
    .replace(/[^a-z0-9\-_]+/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

const buildFilename = (book, format) => {
  const normalizedFormat = normalizeFormat(format);
  const safeTitle = sanitizeFilenamePart(book.title || book.metadata?.title || 'untitled_book');
  const extension = normalizedFormat === 'markdown' ? 'md' : (normalizedFormat || 'download');

  // Pattern: book-title-format-version.extension
  return `${safeTitle || 'book'}-${extension}-version.${extension}`;
};

const ensureBufferBlob = (content, format) => {
  const normalizedFormat = normalizeFormat(format);
  const mimeType = MIME_TYPES[normalizedFormat] || 'application/octet-stream';

  if (content instanceof Blob) {
    return content;
  }

  if (content instanceof ArrayBuffer) {
    return new Blob([content], { type: mimeType });
  }

  if (content instanceof Uint8Array) {
    return new Blob([content], { type: mimeType });
  }

  if (content?.type === 'Buffer' && Array.isArray(content?.data)) {
    const uint = Uint8Array.from(content.data);
    return new Blob([uint], { type: mimeType });
  }

  if (typeof content === 'string') {
    // Handle possible base64 strings for binary formats
    if (BUFFER_LIKE_KEYS.has(normalizedFormat) && /^[A-Za-z0-9+/=]+\s*$/.test(content)) {
      try {
        const decoded = Uint8Array.from(atob(content), (char) => char.charCodeAt(0));
        return new Blob([decoded], { type: mimeType });
      } catch (error) {
        console.warn('Failed to decode base64 content for binary format', error);
      }
    }

    return new Blob([content], { type: mimeType });
  }

  throw new Error(`Unsupported content payload for ${normalizedFormat.toUpperCase()} download`);
};

const extractContentMap = (book) => {
  const contentMap = {};

  if (!book) return contentMap;

  const rawContent = book.content;

  if (typeof rawContent === 'string') {
    try {
      const parsed = JSON.parse(rawContent);
      if (parsed && typeof parsed === 'object') {
        Object.entries(parsed).forEach(([key, value]) => {
          const normalizedKey = normalizeFormat(key);
          if (typeof value === 'string' || typeof value === 'object') {
            contentMap[normalizedKey] = value;
          }
        });
      }
    } catch {
      contentMap.html = rawContent;
    }
  } else if (rawContent && typeof rawContent === 'object') {
    // SURGICAL FIX:
    // For structured book content, prefer the dedicated formats bucket,
    // but also support legacy shapes where formats live at the top level.

    // 1) New shape: content.formats.{html, pdf, md, ...}
    if (rawContent.formats && typeof rawContent.formats === 'object') {
      Object.entries(rawContent.formats).forEach(([key, value]) => {
      const normalizedKey = normalizeFormat(key);
      contentMap[normalizedKey] = value;
    });
    }

    // 2) Legacy / direct formats on the content object itself
    const DIRECT_FORMAT_KEYS = ['html', 'markdown', 'md', 'txt', 'pdf', 'docx', 'epub', 'json'];
    DIRECT_FORMAT_KEYS.forEach((key) => {
      const value = rawContent[key];
      if (value === undefined || value === null) return;
      const normalizedKey = normalizeFormat(key);
      if (!contentMap[normalizedKey]) {
        contentMap[normalizedKey] = value;
      }
    });

    // 3) Allow explicit top-level helpers if present (kept for safety)
    if (typeof rawContent.html === 'string' && !contentMap.html) {
      contentMap.html = rawContent.html;
    }
    if (typeof rawContent.markdown === 'string' && !contentMap.markdown) {
      contentMap.markdown = rawContent.markdown;
    }
  }

  if (book.html && !contentMap.html) {
    contentMap.html = book.html;
  }

  if (book.markdown && !contentMap.markdown) {
    contentMap.markdown = book.markdown;
  }

  return contentMap;
};

const normalizeFormatMapLookup = (formatMap = {}, targetFormat) => {
  const normalizedTarget = normalizeFormat(targetFormat);
  const entry = Object.entries(formatMap).find(
    ([key]) => normalizeFormat(key) === normalizedTarget
  );
  return entry ? entry[1] : undefined;
};

const ensureFullBook = async (bookOrId) => {
  if (!bookOrId) {
    throw new Error('Book reference is required for download');
  }

  if (typeof bookOrId === 'string') {
    return dbService.getBook(bookOrId);
  }

  if (bookOrId.id && (bookOrId.content !== undefined || bookOrId.format_urls !== undefined)) {
    return bookOrId;
  }

  if (bookOrId.id) {
    return dbService.getBook(bookOrId.id);
  }

  throw new Error('Invalid book reference provided');
};

const triggerBrowserDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const getAvailableFormats = (book) => {
  if (!book) return [];

  const formatCandidates = [
    ...(Array.isArray(book.output_formats) ? book.output_formats : []),
    ...(Array.isArray(book?.metadata?.formats) ? book.metadata.formats : []),
    ...Object.keys(book.format_urls || {}),
    ...Object.keys(extractContentMap(book)),
  ];

  const normalizedFormats = Array.from(
    new Set(
      formatCandidates
        .map(normalizeFormat)
        .filter(Boolean)
    )
  );

  // SURGICAL FIX:
  // Only expose supported formats. This prevents garbage like "plain text" or "htr" from showing up.
  return normalizedFormats.filter((fmt) => ALLOWED_FORMATS.has(fmt));
};

export const resolveBookDownload = async (bookOrId, format) => {
  const normalizedFormat = normalizeFormat(format);
  if (!normalizedFormat) {
    throw new Error('Format is required');
  }

  const fullBook = await ensureFullBook(bookOrId);

  const formatUrl = normalizeFormatMapLookup(fullBook.format_urls, normalizedFormat);
  if (formatUrl) {
    return {
      type: 'url',
      url: formatUrl,
      book: fullBook,
      format: normalizedFormat,
      filename: buildFilename(fullBook, normalizedFormat),
    };
  }

  const contentMap = extractContentMap(fullBook);
  const directContent =
    contentMap[normalizedFormat] ??
    (normalizedFormat === 'markdown' ? contentMap.md : undefined) ??
    (normalizedFormat === 'md' ? contentMap.markdown : undefined);

  if (directContent) {
    const blob = ensureBufferBlob(directContent, normalizedFormat);
    return {
      type: 'blob',
      blob,
      book: fullBook,
      format: normalizedFormat,
      filename: buildFilename(fullBook, normalizedFormat),
    };
  }

  throw new Error(`Download for ${normalizedFormat.toUpperCase()} is not available yet.`);
};

export const downloadBookFormat = async (bookOrId, format) => {
  const result = await resolveBookDownload(bookOrId, format);

  if (result.type === 'url') {
    window.open(result.url, '_blank', 'noopener,noreferrer');
    return { book: result.book, source: 'url', format: result.format };
  }

  if (result.type === 'blob') {
    triggerBrowserDownload(result.blob, result.filename);
    return { book: result.book, source: 'content', format: result.format };
  }

  throw new Error(`Unsupported download type: ${result.type}`);
};

export const fetchFullBook = ensureFullBook;

export default {
  downloadBookFormat,
  resolveBookDownload,
  getAvailableFormats,
  fetchFullBook,
};

