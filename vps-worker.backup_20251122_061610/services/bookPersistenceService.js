const path = require('path');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { getSupabase } = require('./supabase');

const DEFAULT_BUCKET = process.env.BOOKS_STORAGE_BUCKET || 'books';

const FORMAT_MIME_TYPES = {
  html: 'text/html',
  md: 'text/markdown',
  markdown: 'text/markdown',
  txt: 'text/plain',
  text: 'text/plain',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  epub: 'application/epub+zip'
};

const FORMAT_EXTENSIONS = {
  html: 'html',
  md: 'md',
  markdown: 'md',
  txt: 'txt',
  text: 'txt',
  pdf: 'pdf',
  docx: 'docx',
  epub: 'epub'
};

class BookPersistenceService {
  constructor() {
    this.bucket = DEFAULT_BUCKET;
  }

  sanitizeFileName(rawTitle = '') {
    const safe = String(rawTitle || 'untitled-book')
      .trim()
      .replace(/[^a-zA-Z0-9\s\-_\.]/g, '')
      .replace(/\s+/g, '_');

    if (!safe || safe.length < 3) {
      return `book_${Date.now()}`;
    }

    return safe.slice(0, 80);
  }

  getExtension(format) {
    const key = (format || '').toLowerCase();
    return FORMAT_EXTENSIONS[key] || key || 'txt';
  }

  getMimeType(format, fallback = 'application/octet-stream') {
    const key = (format || '').toLowerCase();
    return FORMAT_MIME_TYPES[key] || fallback;
  }

  normalizeBufferLike(data, encoding = 'utf8') {
    if (!data) {
      return null;
    }

    if (Buffer.isBuffer(data)) {
      return data;
    }

    if (Array.isArray(data) && data.every(item => typeof item === 'number')) {
      return Buffer.from(data);
    }

    if (typeof data === 'object' && data.type === 'Buffer' && Array.isArray(data.data)) {
      return Buffer.from(data.data);
    }

    if (data instanceof Uint8Array) {
      return Buffer.from(data);
    }

    if (data instanceof ArrayBuffer) {
      return Buffer.from(new Uint8Array(data));
    }

    if (typeof data === 'string') {
      return Buffer.from(data, encoding);
    }

    return null;
  }

  normalizeFormatPayload(formatKey, payload) {
    if (payload == null) {
      return null;
    }

    const lowerKey = (formatKey || '').toLowerCase();
    const defaultMime = this.getMimeType(lowerKey);

    if (typeof payload === 'string') {
      const dataUriMatch = payload.match(/^data:([^;]+);base64,(.+)$/)
      if (dataUriMatch) {
        const [, mime, base64] = dataUriMatch
        const buffer = Buffer.from(base64, 'base64')
        return { buffer, mimeType: mime }
      }

      const buffer = Buffer.from(payload, 'utf8');
      return { buffer, mimeType: defaultMime, textValue: payload };
    }

    if (Buffer.isBuffer(payload) || payload instanceof Uint8Array || payload instanceof ArrayBuffer) {
      const buffer = this.normalizeBufferLike(payload);
      return { buffer, mimeType: defaultMime };
    }

    if (typeof payload === 'object') {
      const { data, encoding, mimeType } = payload;
      if (data == null) {
        return null;
      }

      const inferredEncoding = encoding || (typeof data === 'string' ? 'utf8' : undefined);

      if (typeof data === 'string') {
        if ((inferredEncoding || '').toLowerCase() === 'base64') {
          const buffer = Buffer.from(data, 'base64');
          return { buffer, mimeType: mimeType || defaultMime };
        }

        const buffer = Buffer.from(data, inferredEncoding || 'utf8');
        const textValue = (inferredEncoding || 'utf8') === 'utf8' ? data : undefined;
        return { buffer, mimeType: mimeType || defaultMime, textValue };
      }

      const buffer = this.normalizeBufferLike(data, inferredEncoding || 'utf8');
      if (!buffer) {
        return null;
      }

      const textValue = (inferredEncoding || '').toLowerCase() === 'utf8' ? buffer.toString('utf8') : undefined;
      return { buffer, mimeType: mimeType || defaultMime, textValue };
    }

    const fallback = Buffer.from(String(payload));
    return { buffer: fallback, mimeType: defaultMime, textValue: String(payload) };
  }

  serializeNodeOutputs(nodeOutputs = {}) {
    const sanitized = {};
    for (const [nodeId, result] of Object.entries(nodeOutputs)) {
      if (!result || typeof result !== 'object') continue;
      const { metadata, allFormats, ...rest } = result;
      const sanitizedMeta = metadata ? { ...metadata } : undefined;

      if (sanitizedMeta && sanitizedMeta.allFormats) {
        sanitizedMeta.formats = Object.keys(sanitizedMeta.allFormats || {});
        delete sanitizedMeta.allFormats;
      }

      sanitized[nodeId] = {
        ...rest,
        ...(sanitizedMeta ? { metadata: sanitizedMeta } : {})
      };
    }
    return sanitized;
  }

  buildBookContent(compiledContent, formattedOutput) {
    const normalizedAssets = {
      cover: compiledContent?.assets?.cover
        ? {
            url: compiledContent.assets.cover.url || null,
            prompt: compiledContent.assets.cover.prompt || null,
            layout: compiledContent.assets.cover.layout || null,
            style: compiledContent.assets.cover.style || null,
            metadata: compiledContent.assets.cover.metadata || null,
            sourceNode: compiledContent.assets.cover.sourceNode || null
          }
        : null,
      images: Array.isArray(compiledContent?.assets?.images)
        ? compiledContent.assets.images.map((image) => ({
            url: image.url || null,
            prompt: image.prompt || null,
            negativePrompt: image.negative_prompt || image.negativePrompt || null,
            aspectRatio: image.aspect_ratio || image.aspectRatio || null,
            chapter: image.chapter || null,
            sourceNode: image.sourceNode || null,
            metadata: image.metadata || null
          }))
        : []
    }

    return {
      preview: formattedOutput?.content || '',
      sections: compiledContent?.sections || [],
      structural: compiledContent?.structural || null,
      assets: normalizedAssets,
      totals: {
        words: compiledContent?.totalWords || 0,
        characters: compiledContent?.totalCharacters || 0,
        chapters: Array.isArray(compiledContent?.sections) ? compiledContent.sections.length : 0
      },
      formats: formattedOutput?.allFormats || {}
    };
  }

  async persistExecutionResult({
    executionId,
    userId,
    engineId,
    formattedOutput,
    compiledContent,
    userInput,
    nodeOutputs,
    requestedFormats = [],
    deliverables
  }) {
    if (!userId) {
      logger.warn('📚 Skipping book persistence because userId is missing');
      return null;
    }

    if (!formattedOutput || !formattedOutput.allFormats) {
      throw new Error('No formatted output available for persistence');
    }

    const supabase = getSupabase();

    const formatsAvailable = Object.keys(formattedOutput.allFormats);
    const formatsToPersist = (requestedFormats.length ? requestedFormats : formatsAvailable)
      .map(fmt => fmt && String(fmt).toLowerCase())
      .filter((fmt, idx, arr) => fmt && arr.indexOf(fmt) === idx);

    if (!formatsToPersist.length) {
      throw new Error('No export formats detected for persistence');
    }

    const title = userInput?.book_title || userInput?.story_title || 'Untitled Book';
    const sanitizedTitle = this.sanitizeFileName(title);
    const storagePrefix = `${userId}/${executionId || crypto.randomUUID()}`;

    const formatUrls = {};
    const textSnapshots = {};

    for (const formatKey of formatsToPersist) {
      const payload = formattedOutput.allFormats[formatKey];
      if (!payload) {
        continue;
      }

      const normalized = this.normalizeFormatPayload(formatKey, payload);
      if (!normalized || !normalized.buffer) {
        logger.warn(`⚠️ Failed to normalize payload for format ${formatKey} — skipping upload`);
        continue;
      }

      const extension = this.getExtension(formatKey);
      const mimeType = normalized.mimeType || this.getMimeType(formatKey);
      const objectPath = `${storagePrefix}/${sanitizedTitle}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(this.bucket)
        .upload(objectPath, normalized.buffer, {
          contentType: mimeType,
          upsert: true
        });

      if (uploadError) {
        logger.error(`❌ Failed to upload ${formatKey} to storage`, uploadError);
        throw new Error(`Storage upload failed for ${formatKey}: ${uploadError.message}`);
      }

      const { data: urlData, error: urlError } = supabase.storage
        .from(this.bucket)
        .getPublicUrl(objectPath);

      if (urlError) {
        logger.error(`❌ Failed to resolve URL for ${formatKey}`, urlError);
        throw new Error(`Failed to resolve storage URL for ${formatKey}: ${urlError.message}`);
      }

      formatUrls[formatKey] = urlData.publicUrl;

      if (normalized.textValue) {
        textSnapshots[formatKey] = normalized.textValue;
      }
    }

    if (!Object.keys(formatUrls).length) {
      throw new Error('All format uploads failed — cannot persist book');
    }

    const bookContent = this.buildBookContent(compiledContent, formattedOutput);
    if (Object.keys(textSnapshots).length) {
      bookContent.formats = textSnapshots;
    }

    const metadata = {
      ...(formattedOutput?.metadata || {}),
      formats: formatsToPersist,
      execution_id: executionId,
      engine_id: engineId || userInput?.engine_id || null,
      rawExecutionData: {
        userInput,
        nodeOutputs: this.serializeNodeOutputs(nodeOutputs)
      },
      deliverables: deliverables || null,
      persisted_at: new Date().toISOString()
    };

    const wordCount = compiledContent?.totalWords || 0;
    const type = userInput?.type || 'ebook';
    const tone = userInput?.tone || 'professional';
    const niche = userInput?.genre || userInput?.niche || 'general';
    const targetAudience = userInput?.target_audience || 'general';

    const { data: existingMatches, error: lookupError } = await supabase
      .from('books')
      .select('id, metadata')
      .eq('user_id', userId)
      .contains('metadata', { execution_id: executionId })
      .limit(1);

    if (lookupError) {
      logger.error('❌ Failed to check for existing book record', lookupError);
      throw new Error(`Failed to query existing book record: ${lookupError.message}`);
    }

    let bookId;

    if (existingMatches && existingMatches.length) {
      const existing = existingMatches[0];
      const { data: updated, error: updateError } = await supabase
        .from('books')
        .update({
          title,
          type,
          tone,
          niche,
          target_audience: targetAudience,
          status: 'completed',
          content: bookContent,
          metadata: {
            ...(existing.metadata || {}),
            ...metadata
          },
          format_urls: formatUrls,
          output_formats: formatsToPersist,
          word_count: wordCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        logger.error('❌ Failed to update existing book record', updateError);
        throw new Error(`Failed to update existing book: ${updateError.message}`);
      }

      bookId = updated.id;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('books')
        .insert([
          {
            user_id: userId,
            title,
            type,
            tone,
            niche,
            target_audience: targetAudience,
            status: 'completed',
            content: bookContent,
            metadata,
            format_urls: formatUrls,
            output_formats: formatsToPersist,
            ai_service: userInput?.ai_service || null,
            word_count: wordCount
          }
        ])
        .select()
        .single();

      if (insertError) {
        logger.error('❌ Failed to insert new book record', insertError);
        throw new Error(`Failed to save book record: ${insertError.message}`);
      }

      bookId = inserted.id;
    }

    logger.info(`📚 Book persisted successfully for execution ${executionId}`);

    return {
      bookId,
      formatUrls,
      outputFormats: formatsToPersist,
      title,
      status: 'completed'
    };
  }
}

module.exports = new BookPersistenceService();
