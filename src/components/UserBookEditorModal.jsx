import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  BookOpen,
  Eye,
  Edit3,
  Save,
  Download,
  Loader2,
  FileText,
  File,
  FileCheck,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import RichTextEditor from './RichTextEditor';
import { supabase } from '../lib/supabase';
import { useUserAuth } from '../contexts/UserAuthContext';

const EMPTY_BOOK_PAYLOAD = {
  title: 'Untitled Manuscript',
  markdown: '',
  html: '',
  chapters: [],
  formats: {},
  formatUrls: {},
  compiledData: null,
  assets: { cover: null, images: [] },
  bookId: null,
  userInput: {},
  metadata: {}
};

const sanitizeHtmlContent = (html = '') => {
  if (typeof html !== 'string') return '';
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .trim();
};

const countWords = (html = '') => {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return 0;
  return text.split(' ').length;
};

const countCharacters = (html = '') => {
  const text = html.replace(/<[^>]*>/g, '');
  return text.length;
};

const UserBookEditorModal = ({ isOpen, onClose, bookData = EMPTY_BOOK_PAYLOAD, onSave }) => {
  const { user } = useUserAuth();
  const hydratedBook = bookData || EMPTY_BOOK_PAYLOAD;

  const [mode, setMode] = useState('edit');
  const [editorContent, setEditorContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(null);

  // Compute typography preferences from user input with elegant defaults
  const typography = useMemo(() => {
    const ui = hydratedBook?.userInput || {};
    const bodyFont =
      ui.typography_combo ||
      ui.body_font ||
      ui.font_family ||
      'Georgia, serif';
    const headingFont =
      ui.heading_font ||
      'Merriweather, Georgia, serif';
    const fontSize =
      ui.font_size ||
      '16px';
    const lineHeight =
      ui.line_height ||
      1.9;
    return { bodyFont, headingFont, fontSize, lineHeight };
  }, [hydratedBook?.userInput]);

  useEffect(() => {
    if (!isOpen) {
      return () => {
        setEditorContent('');
        setActiveChapterId(null);
        setMode('edit');
      };
    }

    // SURGICAL FIX: Prefer professionally formatted HTML from formats, fallback to canonical HTML
    const formattedHtml = hydratedBook.formats?.html || 
                          hydratedBook.formats?.HTML || 
                          hydratedBook.formatUrls?.html ? null : null; // URLs need fetch, skip for now
    const canonicalHtml = hydratedBook.html || '';
    const markdownFallback = hydratedBook.markdown || '';
    
    // Use formatted HTML if available, otherwise canonical HTML, otherwise markdown
    const nextHtml = formattedHtml || canonicalHtml || markdownFallback;
    setEditorContent(sanitizeHtmlContent(nextHtml));
    setActiveChapterId(hydratedBook.chapters?.[0]?.id || null);
  }, [isOpen, hydratedBook.html, hydratedBook.markdown, hydratedBook.chapters, hydratedBook.formats]);

  const availableFormats = useMemo(() => {
    const fromFormats = Object.keys(hydratedBook.formats || {});
    const fromUrls = Object.keys(hydratedBook.formatUrls || {});
    return Array.from(new Set([...fromFormats, ...fromUrls])).filter(Boolean);
  }, [hydratedBook.formats, hydratedBook.formatUrls]);

  const activeChapter = useMemo(() => {
    if (!activeChapterId) return null;
    return (hydratedBook.chapters || []).find((chap) => chap.id === activeChapterId) || null;
  }, [activeChapterId, hydratedBook.chapters]);

  const handleDownload = async (format) => {
    if (!format) return;
    setIsDownloading(true);

    try {
      const normalized = format.toLowerCase();
      const formatUrls = hydratedBook.formatUrls || {};
      const inlineFormats = hydratedBook.formats || {};

      if (formatUrls[normalized]) {
        window.open(formatUrls[normalized], '_blank', 'noopener,noreferrer');
        toast.success(`Opening ${normalized.toUpperCase()} in new tab`);
        return;
      }

      const inlineContent =
        inlineFormats[normalized] ||
        inlineFormats[format] ||
        (normalized === 'html' ? hydratedBook.html : null) ||
        (normalized === 'md' || normalized === 'markdown' ? hydratedBook.markdown : null);

      if (!inlineContent) {
        toast.error(`${format.toUpperCase()} format not available yet.`);
        return;
      }

      const mimeMap = {
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        html: 'text/html',
        md: 'text/markdown',
        markdown: 'text/markdown',
        txt: 'text/plain',
        epub: 'application/epub+zip'
      };

      const blob = new Blob([inlineContent], { type: mimeMap[normalized] || 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeTitle = (hydratedBook.title || 'lekhika_manuscript').replace(/[^a-z0-9]+/gi, '-').toLowerCase();

      link.href = url;
      link.download = `${safeTitle}-${normalized}.${normalized === 'markdown' ? 'md' : normalized}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${format.toUpperCase()} file`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download format');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveEdits = () => {
    const cleanedContent = sanitizeHtmlContent(editorContent);
    if (!cleanedContent || cleanedContent.trim().length === 0) {
      toast.error('Content cannot be empty');
      return;
    }

    const payload = {
      ...hydratedBook,
      html: cleanedContent,
      markdown: hydratedBook.markdown,
      editedAt: new Date().toISOString()
    };

    if (typeof onSave === 'function') {
      onSave(payload);
    }

    toast.success('Draft updated in memory. Persist to Supabase to finalize.');
  };

  const handlePersist = async () => {
    if (!user?.id) {
      toast.error('You must be signed in to save.');
      return;
    }

    setIsSaving(true);

    try {
      const cleanedContent = sanitizeHtmlContent(editorContent);
      const words = countWords(cleanedContent);

      // SURGICAL FIX:
      // Do NOT blow away structured book content (chapters, formats, assets, etc.)
      // If an existing content object is present, merge the edited HTML into it.
      // If content is a simple string (legacy books), keep the previous behavior.
      const existingContent = hydratedBook.content;
      let nextContent;

      if (existingContent && typeof existingContent === 'object') {
        nextContent = {
          ...existingContent,
          html: cleanedContent,
          // Preserve markdown if it exists, otherwise fall back to hydratedBook.markdown if provided
          markdown: existingContent.markdown || hydratedBook.markdown || ''
        };
        // Invalidate previously generated formats so downloads reflect edits
        nextContent.formats = {};
      } else {
        // Legacy / simple books: content is just the HTML string
        nextContent = cleanedContent;
      }

      const bookPayload = {
        user_id: user.id,
        title: hydratedBook.title || 'Untitled Manuscript',
        type: hydratedBook.userInput?.book_type || hydratedBook.userInput?.type || 'ebook',
        niche: hydratedBook.userInput?.niche || hydratedBook.userInput?.genre || 'general',
        status: 'completed',
        content: nextContent,
        // Invalidate remote URLs to avoid stale downloads; client will use structured content
        format_urls: {},
        word_count: words,
        ai_service: hydratedBook.metadata?.ai_service || hydratedBook.userInput?.ai_service || null,
        updated_at: new Date().toISOString(),
        metadata: {
          ...(hydratedBook.metadata || {}),
          formats: [],
          updatedByEditor: true,
          lastEditorUserId: user.id,
          lastEditorAt: new Date().toISOString()
        }
      };

      let savedBookId = hydratedBook.bookId
      if (savedBookId) {
        const { error } = await supabase
          .from('books')
          .update(bookPayload)
          .eq('id', savedBookId);

        if (error) throw error;
        toast.success('Book updated in Supabase');
      } else {
        const insertPayload = {
          ...bookPayload,
          created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('books')
          .insert([insertPayload])
          .select('id')
          .single();

        if (error) throw error;
        toast.success('Book saved to Supabase');

        savedBookId = data?.id || null
        if (typeof onSave === 'function') {
          onSave({ ...hydratedBook, bookId: savedBookId, html: cleanedContent });
        }
      }

      // Attempt background regenerate of formats via Edge Function (non-blocking)
      try {
        const baseUrl = import.meta.env.VITE_SUPABASE_URL
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
        if (baseUrl && anonKey && savedBookId) {
          const url = `${baseUrl}/functions/v1/engines-api/books/${savedBookId}/regenerate-formats`
          const resp = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${anonKey}`,
              'apikey': anonKey
            },
            body: JSON.stringify({
              reason: 'user_edit',
              priority: 'low'
            })
          })
          if (resp.ok) {
            toast.success('Regenerating formats in background')
          } else {
            console.debug('Format regenerate request not available:', await resp.text())
          }
        }
      } catch (e) {
        console.debug('Format regenerate skipped:', e?.message)
      }
    } catch (error) {
      console.error('Persist error:', error);
      toast.error(error.message || 'Failed to persist book');
    } finally {
      setIsSaving(false);
    }
  };

  const coverAsset = hydratedBook.assets?.cover || null;
  const galleryAssets = [
    ...(hydratedBook.assets?.images || []),
    ...(hydratedBook.assets?.gallery || [])
  ];

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="user-book-editor-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 24 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="relative mx-auto mt-10 h-[90vh] w-[90vw] max-w-6xl overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/95 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="flex items-center justify-between border-b border-slate-800/70 px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-emerald-500/10 p-3">
                <BookOpen className="h-6 w-6 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">{hydratedBook.title || 'Untitled Manuscript'}</h2>
                <p className="text-sm text-slate-400">Rich editor · All formats · Assets preserved</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800/70 hover:text-white"
              aria-label="Close editor"
            >
              <X className="h-6 w-6" />
            </button>
          </header>

          <div className="flex h-[calc(90vh-80px)] divide-x divide-slate-800/60">
            <aside className="hidden w-64 flex-shrink-0 flex-col gap-6 overflow-y-auto bg-slate-950/40 p-6 lg:flex">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Chapters</h3>
                <div className="mt-3 space-y-2">
                  {(hydratedBook.chapters || []).map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => {
                        setActiveChapterId(chapter.id);
                        if (chapter.content) {
                          const chapterMarkup = `<h2>${chapter.title}</h2>\n${chapter.content || ''}`;
                          setEditorContent(sanitizeHtmlContent(chapterMarkup));
                        }
                      }}
                      className={`w-full rounded-xl border border-slate-800/70 px-3 py-2 text-left text-sm transition ${
                        chapter.id === activeChapterId ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200' : 'hover:border-slate-700/70 hover:bg-slate-900'
                      }`}
                    >
                      <span className="block font-medium">{chapter.title || `Chapter ${chapter.number}`}</span>
                      <span className="text-xs text-slate-500">{chapter.content ? countWords(chapter.content) : 0} words</span>
                    </button>
                  ))}
                  {hydratedBook.chapters?.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-800/70 p-3 text-xs text-slate-500">
                      No chapter breakdown detected. Editing entire manuscript.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Assets</h3>
                <div className="mt-3 space-y-3">
                  {coverAsset ? (
                    <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-3">
                      <span className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <ImageIcon className="h-4 w-4 text-emerald-300" /> Cover Artwork
                      </span>
                      <img
                        src={coverAsset.url}
                        alt="Cover"
                        className="mt-3 w-full rounded-lg bg-slate-950/60 object-cover"
                      />
                      {coverAsset.prompt && (
                        <p className="mt-2 text-xs text-slate-500">Prompt: {coverAsset.prompt}</p>
                      )}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-slate-800/70 p-3 text-xs text-slate-500">
                      No cover image attached yet.
                    </p>
                  )}

                  {galleryAssets.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gallery</span>
                      <div className="grid grid-cols-2 gap-2">
                        {galleryAssets.slice(0, 4).map((asset, index) => (
                          <img
                            key={`${asset.url || 'asset'}-${index}`}
                            src={asset.url}
                            alt={asset.prompt || 'Illustration'}
                            className="h-24 w-full rounded-lg object-cover"
                          />
                        ))}
                      </div>
                      {galleryAssets.length > 4 && (
                        <p className="text-xs text-slate-500">+{galleryAssets.length - 4} additional illustrations</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            <main className="flex flex-1 flex-col overflow-hidden">
              <div className="border-b border-slate-800/60 bg-slate-950/40 px-6 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMode((prev) => (prev === 'edit' ? 'preview' : 'edit'))}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                        mode === 'edit'
                          ? 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                          : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {mode === 'edit' ? (
                        <>
                          <Eye className="h-4 w-4" /> Preview
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4" /> Edit
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleSaveEdits}
                      className="flex items-center gap-2 rounded-xl bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-500/30"
                    >
                      <Save className="h-4 w-4" /> Snapshot Changes
                    </button>

                    <button
                      onClick={handlePersist}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-900 transition hover:bg-emerald-400 disabled:opacity-60"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" /> Save to Supabase
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {availableFormats.length > 0 && (
                      <div className="relative">
                        <button
                          onClick={() => handleDownload(availableFormats[0])}
                          disabled={isDownloading}
                          className="flex items-center gap-2 rounded-xl bg-slate-800/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700/70"
                        >
                          {isDownloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          Download {availableFormats[0]?.toUpperCase()}
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-4 rounded-xl border border-slate-800/70 bg-slate-900/70 px-4 py-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <File className="h-4 w-4 text-emerald-300" />
                        {countWords(editorContent).toLocaleString()} words
                      </span>
                      <span className="flex items-center gap-1">
                        <FileCheck className="h-4 w-4 text-emerald-300" />
                        {countCharacters(editorContent).toLocaleString()} chars
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <section className="flex-1 overflow-y-auto bg-slate-950/30 px-6 py-6">
                {mode === 'edit' ? (
                  <div className="rounded-2xl border border-slate-800/60 bg-slate-900/80 p-4 shadow-inner">
                    <RichTextEditor
                      value={editorContent}
                      onChange={setEditorContent}
                      height={540}
                      placeholder="Edit your manuscript..."
                      // Hint the editor with body font/size for better WYSIWYG feel
                      style={{ fontFamily: typography.bodyFont, fontSize: typography.fontSize, lineHeight: typography.lineHeight }}
                    />
                  </div>
                ) : (
                  <div
                    className="prose prose-invert max-w-none rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 shadow-inner overflow-y-auto"
                    style={{ fontFamily: typography.bodyFont, fontSize: typography.fontSize, lineHeight: typography.lineHeight }}
                  >
                    {/* Professional book styling for canonical structure */}
                    <style>{`
                      .prose h1, .prose h2, .prose h3, .prose h4 { font-family: ${typography.headingFont}; }
                      .prose p, .prose li, .prose blockquote { font-family: ${typography.bodyFont}; }
                      .prose section { margin-bottom: 3rem; page-break-inside: avoid; }
                      .prose section#title-page { text-align: center; padding: 4rem 2rem; margin-bottom: 4rem; border-bottom: 2px solid rgba(255,255,255,0.1); }
                      .prose section#title-page h1 { font-size: 3.5em; margin-bottom: 1rem; font-weight: 700; color: rgba(255,255,255,0.95); }
                      .prose section#title-page p { font-size: 1.5em; margin-top: 2rem; color: rgba(255,255,255,0.7); }
                      .prose section#foreword, .prose section#introduction { margin-top: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.02); border-left: 3px solid rgba(139, 92, 246, 0.5); }
                      .prose section#about-author { margin-top: 3rem; padding: 2rem; background: rgba(139, 92, 246, 0.08); border-radius: 0.5rem; border: 1px solid rgba(139, 92, 246, 0.3); }
                      .prose section#about-author h2 { color: rgba(139, 92, 246, 0.9); margin-bottom: 1rem; }
                      .prose section#about-author strong { font-size: 1.2em; color: rgba(255,255,255,0.9); }
                      .prose section#toc { margin: 2rem 0; padding: 1.5rem; background: rgba(139, 92, 246, 0.05); border-radius: 0.5rem; }
                      .prose section#toc ul { list-style: none; padding-left: 0; }
                      .prose section#toc li { margin: 0.5rem 0; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
                      .prose section#toc a { color: rgba(139, 92, 246, 0.9); text-decoration: none; transition: color 0.2s; }
                      .prose section#toc a:hover { color: rgba(139, 92, 246, 1); }
                      .prose section[id^="chapter"] { margin: 3rem 0; padding: 2rem 0; border-top: 2px solid rgba(255,255,255,0.1); }
                      .prose section[id^="chapter"] h2 { font-size: 2rem; margin-bottom: 1.5rem; color: rgba(139, 92, 246, 0.9); }
                      .prose section[id^="chapter"] div { line-height: ${typography.lineHeight}; text-align: justify; }
                      .prose .chapter-image { margin: 2rem 0; text-align: center; }
                      .prose .chapter-image img { max-width: 100%; height: auto; border-radius: 0.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
                      .prose .chapter-image figcaption { margin-top: 0.5rem; font-size: 0.875rem; color: rgba(255,255,255,0.6); font-style: italic; }
                      .prose section#visual-gallery { margin-top: 3rem; padding: 2rem; background: rgba(139, 92, 246, 0.05); border-radius: 0.5rem; }
                      .prose .chapter-gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
                    `}</style>
                    <div dangerouslySetInnerHTML={{ __html: editorContent || '<p>No content to preview yet.</p>' }} />
                  </div>
                )}
              </section>
            </main>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserBookEditorModal;
