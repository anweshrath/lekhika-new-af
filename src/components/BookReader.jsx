import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import HTMLFlipBook from 'react-pageflip';
// SURGICAL STRIKE: Restore Columns icon for the manual toggle.
import { ArrowLeft, Maximize, Minimize, ChevronLeft, ChevronRight, Columns } from 'lucide-react'; 

import dbService from '../services/database';
import { downloadBookFormat } from '../services/bookDownloadService';
import FloatingDownloadBar from './FloatingDownloadBar';
import toast from 'react-hot-toast';
import BookThemeToggle from './BookThemeToggle';
import '../styles/BookReaderTheme.css';

import '../styles/BookReader.css';


// SURGICAL STRIKE: The inconsistent page footer is permanently annihilated.
const Page = React.forwardRef(({ children }, ref) => (
  <div className="page" ref={ref}>
    <div className="page-content book-content" dangerouslySetInnerHTML={{ __html: children }} />
  </div>
));


// --- Fullscreen Flip Book Component ---
// This component is now the ONLY export of this file. The inline view is gone.
const FullScreenReader = ({ htmlContent, onClose, book, onUnifiedExport }) => {
  const [pages, setPages] = useState([]);
  const [viewMode, setViewMode] = useState(() => (window.innerWidth < 768 ? 'scroll' : 'flip')); // 'flip' | 'scroll'
  const [toc, setToc] = useState([]); // [{ id, title }]
  const [activeId, setActiveId] = useState(null);
  const [soundOn, setSoundOn] = useState(true);

  // SURGICAL RESTORATION: The manual toggle is back. My garbage auto-detection is gone.
  const [isSinglePane, setIsSinglePane] = useState(() => {
    const savedPreference = localStorage.getItem('lekhika-view-mode');
    if (savedPreference) {
      return savedPreference === 'single';
    }
    return window.innerWidth < 1024; // Default only on first ever load.
  });

  // SURGICAL STRIKE: Add dedicated theme state for the fullscreen reader.
  const [readerTheme, setReaderTheme] = useState(() => {
    return localStorage.getItem('lekhika-reader-theme') || 'dark';
  });

  const [size, setSize] = useState({ width: 0, height: 0 });
  // SURGICAL STRIKE: This state now tracks the PHYSICAL page index (e.g., 0-11).
  const [currentPageIndex, setCurrentPageIndex] = useState(0); 
  
  const flipBook = useRef(null);
  const containerRef = useRef(null);
  const pageRefs = useRef([]);
  const audioRef = useRef(null);
  const scrollRef = useRef(null);
  const [progressPct, setProgressPct] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    const currentContainer = containerRef.current;
    if (currentContainer) observer.observe(currentContainer);
    return () => {
      if (currentContainer) observer.unobserve(currentContainer);
    };
  }, []);

  // Save user's preference whenever it changes.
  useEffect(() => {
    localStorage.setItem('lekhika-view-mode', isSinglePane ? 'single' : 'double');
  }, [isSinglePane]);

  // Save reader's theme whenever it changes.
  useEffect(() => {
    localStorage.setItem('lekhika-reader-theme', readerTheme);
  }, [readerTheme]);

  // SURGICAL FIX: Proper page splitting respecting canonical structure (sections, title page, TOC, chapters)
  useEffect(() => {
    if (!htmlContent) {
      setPages([]);
      setToc([]);
      return;
    }
    
    // Extract TOC entries from sections with IDs (canonical structure) or h2 headings (fallback)
    try {
      const temp = document.createElement('div');
      temp.innerHTML = htmlContent;
      
      // First try: Look for sections with IDs (canonical structure)
      const sections = Array.from(temp.querySelectorAll('section[id]'));
      if (sections.length > 0) {
        const entries = sections.map((section) => {
          const id = section.getAttribute('id') || '';
          const h2 = section.querySelector('h2');
          const title = h2 ? h2.textContent.trim() : id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return { id, title };
        }).filter(e => e.id && !e.id.includes('title-page')); // Exclude title page from TOC
        setToc(entries);
      } else {
        // Fallback: Extract from h2 headings
        const headings = Array.from(temp.querySelectorAll('h2'));
        const entries = headings.map((h, i) => {
          const id = h.getAttribute('id') || h.closest('section')?.getAttribute('id') || `chapter-${i + 1}`;
          return { id, title: (h.textContent || `Chapter ${i + 1}`).trim() };
        });
        setToc(entries);
      }
    } catch (e) {
      console.warn('TOC extraction failed:', e);
    }
    
    // SURGICAL FIX: Split by sections (canonical) or h2 (fallback), then split large sections into readable pages
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Try to split by sections first (canonical structure)
    let sections = Array.from(tempDiv.querySelectorAll('section'));
    if (sections.length === 0) {
      // Fallback: Split by h2 headings
      const h2s = Array.from(tempDiv.querySelectorAll('h2'));
      if (h2s.length > 0) {
        sections = h2s.map(h2 => {
          const section = document.createElement('section');
          section.setAttribute('id', h2.getAttribute('id') || `section-${h2s.indexOf(h2)}`);
          let next = h2.nextSibling;
          section.appendChild(h2.cloneNode(true));
          while (next && next.nodeName !== 'H2') {
            const clone = next.cloneNode(true);
            section.appendChild(clone);
            next = next.nextSibling;
          }
          return section;
        });
      } else {
        // Last resort: treat entire content as one section
        sections = [tempDiv];
      }
    }
    
    // Split each section into readable pages (max ~800 words per page)
    const wordsPerPage = 800;
    const physicalPages = [];
    
    sections.forEach((section, sectionIdx) => {
      const sectionHtml = section.outerHTML || section.innerHTML;
      const tempSection = document.createElement('div');
      tempSection.innerHTML = sectionHtml;
      const text = tempSection.textContent || '';
      const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
      
      if (wordCount <= wordsPerPage) {
        // Section fits on one page
        physicalPages.push(sectionHtml);
      } else {
        // Split section into multiple pages
        const paragraphs = Array.from(tempSection.querySelectorAll('p, h1, h2, h3, h4, div, figure'));
        let currentPage = [];
        let currentWordCount = 0;
        
        paragraphs.forEach((para) => {
          const paraText = para.textContent || '';
          const paraWords = paraText.split(/\s+/).filter(w => w.length > 0).length;
          
          if (currentWordCount + paraWords > wordsPerPage && currentPage.length > 0) {
            // Start new page
            const pageDiv = document.createElement('div');
            currentPage.forEach(p => pageDiv.appendChild(p.cloneNode(true)));
            physicalPages.push(pageDiv.innerHTML);
            currentPage = [para];
            currentWordCount = paraWords;
          } else {
            currentPage.push(para);
            currentWordCount += paraWords;
          }
        });
        
        // Add remaining content
        if (currentPage.length > 0) {
          const pageDiv = document.createElement('div');
          currentPage.forEach(p => pageDiv.appendChild(p.cloneNode(true)));
          physicalPages.push(pageDiv.innerHTML);
        }
      }
    });

    // Filter out empty pages
    const filteredPages = physicalPages.filter(p => {
      const temp = document.createElement('div');
      temp.innerHTML = p;
      const text = temp.textContent || '';
      return text.trim().length > 0 && text.trim() !== '<p></p>';
    });

    // For two-pane view, we must have an even number of pages for the flipbook.
    if (!isSinglePane && filteredPages.length % 2 !== 0) {
      filteredPages.push('<div style="padding: 2rem;"><p></p></div>'); // Add a blank page at the end for layout.
    }

    setPages(filteredPages);
  }, [htmlContent, isSinglePane]);


  // Navigation hooks now correctly depend on the manual toggle state.
  useEffect(() => {
    const handleKeyDown = (event) => {
      const scrollAmount = 120;
      if (event.key === 'ArrowLeft') {
        flipBook.current?.pageFlip()?.flipPrev();
      } else if (event.key === 'ArrowRight') {
        flipBook.current?.pageFlip()?.flipNext();
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        const pageFlipIndex = flipBook.current?.pageFlip()?.getCurrentPageIndex() || 0;
        const targetIndices = isSinglePane ? [pageFlipIndex] : [pageFlipIndex * 2, pageFlipIndex * 2 + 1];

        targetIndices.forEach(index => {
          const pageElement = pageRefs.current[index];
          if (pageElement) {
            pageElement.scrollBy({ top: scrollAmount * direction, behavior: 'smooth' });
          }
        });
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSinglePane]);

  useEffect(() => {
    const swipeThreshold = 10;
    let swipeTimeout = null;
    const handleWheel = (event) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > swipeThreshold) {
        event.preventDefault();
        if (swipeTimeout) return;
        if (event.deltaX > 0) {
          flipBook.current?.pageFlip()?.flipNext();
        } else {
          flipBook.current?.pageFlip()?.flipPrev();
        }
        swipeTimeout = setTimeout(() => { swipeTimeout = null; }, 500); 
      }
    };
    const currentContainer = containerRef.current;
    if (currentContainer) currentContainer.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      if (currentContainer) currentContainer.removeEventListener('wheel', handleWheel);
      if (swipeTimeout) clearTimeout(swipeTimeout);
    };
  }, []);

  const totalPages = pages.length;
  const pageFlipWidth = isSinglePane ? size.width : size.width / 2;

  // SURGICAL STRIKE: This handler now sanitizes the garbage index from the library.
  const onFlip = useCallback((e) => {
    const rawPageIndex = e.data;
    // In two-pane mode, the library might incorrectly report an odd index for the last page.
    // We will force it to the correct even-numbered index for the start of the spread.
    const newPageIndex = isSinglePane ? rawPageIndex : Math.floor(rawPageIndex / 2) * 2;
    setCurrentPageIndex(newPageIndex);
    if (soundOn && audioRef.current) {
      try { audioRef.current.currentTime = 0; audioRef.current.play().catch(()=>{}); } catch {}
    }
    // Update progress in flip mode
    const visibleCount = isSinglePane ? 1 : 2;
    const viewed = Math.min(newPageIndex + visibleCount, totalPages);
    const pct = totalPages > 0 ? Math.max(0, Math.min(100, Math.round((viewed / totalPages) * 100))) : 0;
    setProgressPct(pct);
  }, [isSinglePane]);
  
  // SURGICAL STRIKE: This calculation is now simple and correct.
  const totalSpreads = isSinglePane ? totalPages : Math.ceil(totalPages / 2);

  const toggleReaderTheme = () => {
    setReaderTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Scroll mode: observe headings/sections for active TOC highlight
  useEffect(() => {
    if (viewMode !== 'scroll') return;
    const root = scrollRef.current || document.querySelector('.reader-scroll');
    if (!root) return;
    // Try sections with IDs first (canonical), then h2 headings (fallback)
    const targets = Array.from(root.querySelectorAll('section[id], h2[id]'));
    if (targets.length === 0) return;
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]?.target?.id) {
        const id = visible[0].target.id || visible[0].target.closest('section[id]')?.getAttribute('id');
        if (id) setActiveId(id);
      }
    }, { root, rootMargin: '0px 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });
    targets.forEach(t => io.observe(t));
    return () => io.disconnect();
  }, [viewMode, htmlContent]);

  // Scroll mode: update slim progress bar
  useEffect(() => {
    if (viewMode !== 'scroll') return;
    const root = scrollRef.current;
    if (!root) return;
    const onScroll = () => {
      const max = root.scrollHeight - root.clientHeight;
      const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((root.scrollTop / max) * 100))) : 0;
      setProgressPct(pct);
    };
    root.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => root.removeEventListener('scroll', onScroll);
  }, [viewMode, htmlContent]);

  const scrollToId = (id) => {
    if (viewMode === 'scroll') {
      const el = document.getElementById(id) || document.querySelector(`section[id="${id}"]`);
      if (el && scrollRef.current) {
        const scrollContainer = scrollRef.current;
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const elementTop = el.getBoundingClientRect().top;
        scrollContainer.scrollBy({
          top: elementTop - containerTop - 20,
          behavior: 'smooth'
        });
      }
    } else {
      // Flip mode: find the page containing this section and navigate to it
      const temp = document.createElement('div');
      temp.innerHTML = htmlContent;
      const targetSection = temp.querySelector(`section[id="${id}"]`);
      if (targetSection && flipBook.current) {
        // Find which page contains this section
        const sectionIndex = Array.from(temp.querySelectorAll('section')).indexOf(targetSection);
        if (sectionIndex >= 0) {
          const targetPage = isSinglePane ? sectionIndex : Math.floor(sectionIndex / 2) * 2;
          flipBook.current.pageFlip().flip(targetPage);
        }
      }
    }
  };

  return (
    <motion.div 
      className={`fullscreen-reader-overlay ${readerTheme === 'light' ? 'reader-theme-light' : 'reader-theme-dark'}`}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* Tiny embedded audio (base64 placeholder) */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQgAAAAA" preload="auto" />
      <header className="fullscreen-header">
        <div className="flex items-center gap-2">
          <motion.button onClick={onClose}><Minimize size={24} /></motion.button>
          <BookThemeToggle theme={readerTheme} onToggle={toggleReaderTheme} />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold">{book.title}</h1>
          <p>by {book.author || 'Lekhika AI'}</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button onClick={() => setSoundOn(s => !s)} title={soundOn ? 'Sound: On' : 'Sound: Off'}>
            {soundOn ? '🔊' : '🔈'}
          </motion.button>
          <motion.button onClick={() => setViewMode(m => (m === 'flip' ? 'scroll' : 'flip'))} title={viewMode === 'flip' ? 'Switch to Scroll' : 'Switch to Flip'}>
            <Columns size={24} />
          </motion.button>
          {viewMode === 'flip' && (
            <motion.button onClick={() => setIsSinglePane(!isSinglePane)} title={isSinglePane ? "Two-Page View" : "Single-Page View"}>
              {isSinglePane ? '📖' : '📕'}
            </motion.button>
          )}
        </div>
      </header>
      {/* Slim reading progress bar */}
      <div className="reader-progress">
        <div className="reader-progress-inner" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="reader-body">
        {/* Sticky TOC */}
        {toc.length > 0 && (
          <aside className="reader-toc">
            <div className="reader-toc-title">Contents</div>
            <ul>
              {toc.map(entry => (
                <li key={entry.id}>
                  <button
                    className={`reader-toc-item ${activeId === entry.id ? 'active' : ''}`}
                    onClick={() => scrollToId(entry.id)}
                  >
                    {entry.title}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}
        {viewMode === 'flip' ? (
          <div className="flipbook-container" ref={containerRef}>
            {size.width > 0 && totalPages > 0 && (
              <>
                <HTMLFlipBook
                  width={pageFlipWidth} height={size.height}
                  onFlip={onFlip}
                  ref={flipBook}
                  key={`${isSinglePane}-${size.width}-${size.height}-${totalPages}`}
                  className="html-flip-book"
                  flippingTime={600}
                  swipeDistance={10}
                  usePortrait={isSinglePane}
                  startZIndex={2}
                  maxShadowOpacity={0.3}
                >
                  {pages.map((content, i) => (
                    <Page ref={el => (pageRefs.current[i] = el)} key={i}>{content}</Page>
                  ))}
                </HTMLFlipBook>
                <div className="pagination-controls">
                  <motion.button className="pagination-button" onClick={() => flipBook.current?.pageFlip()?.flipPrev()} disabled={currentPageIndex === 0}>
                    <ChevronLeft size={24} />
                  </motion.button>
                  <span className="pagination-display">
                    Page {isSinglePane 
                      ? `${currentPageIndex + 1}` 
                      : `${currentPageIndex + 1}-${Math.min(currentPageIndex + 2, totalPages)}`
                    } of {totalPages}
                  </span>
                  <motion.button 
                    className="pagination-button" 
                    onClick={() => flipBook.current?.pageFlip()?.flipNext()} 
                    disabled={isSinglePane ? currentPageIndex >= totalPages - 1 : (currentPageIndex + 2) >= totalPages}
                  >
                    <ChevronRight size={24} />
                  </motion.button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="reader-scroll" ref={scrollRef}>
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        )}
      </div>
      <FloatingDownloadBar book={book} onExport={onUnifiedExport} />
    </motion.div>
  );
};


// --- Main BookReader Component ---
// SURGICAL STRIKE: This component is now a simple wrapper that ONLY renders the fullscreen experience.
const BookReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bookData, setBookData] = useState(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const extractHtmlContent = (bookData) => {
    if (!bookData) return ""

    const content = bookData.content

    // 1) New canonical shape: formats bucket on the content object
    if (content && typeof content === 'object') {
      const formats = content.formats || {}
      if (typeof formats.html === 'string' && formats.html.trim().length > 0) {
        return formats.html
      }
      // Also check top-level html in content object
      if (typeof content.html === 'string' && content.html.trim().length > 0) {
        return content.html
      }
    }

    // 2) Legacy helper: top-level html field on the content object
    if (content && typeof content.html === 'string' && content.html.trim().length > 0) {
      return content.html
    }

    // 3) Old shape: content is a JSON string that may contain an html field
    if (typeof content === 'string') {
      try {
        const parsed = JSON.parse(content)
        if (parsed && typeof parsed.html === 'string' && parsed.html.trim().length > 0) {
          return parsed.html
        }
        // Check for formats.html in parsed JSON
        if (parsed && parsed.formats && typeof parsed.formats.html === 'string' && parsed.formats.html.trim().length > 0) {
          return parsed.formats.html
        }
      } catch (e) {
        // Fallback: treat raw string as HTML if it looks like HTML
        if (content.trim().startsWith('<') || content.includes('</')) {
          return content
        }
      }
    }

    return ""
  };

  useEffect(() => {
    const loadBookData = async () => {
      setIsLoading(true);
      try {
        const book = await dbService.getBook(id);
        if (book) {
          setBookData(book);
          const content = extractHtmlContent(book);
          setHtmlContent(content);
        } else {
          toast.error("Book not found.");
        }
      } catch (error) {
        console.error("Error loading book:", error);
        toast.error("Failed to load book data.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadBookData();
  }, [id]);
  
  // SURGICAL STRIKE: The export handler is now fixed to be fully authenticated.
  const handleUnifiedExport = async (bookToExport, format) => {
    if (!bookToExport) {
      toast.error('Book data is not available.');
      return;
    }

    const displayFormat = String(format || '').toUpperCase();
    toast.loading(`Exporting to ${displayFormat}...`, { id: 'export' });

    try {
      const { source, format: normalizedFormat } = await downloadBookFormat(bookToExport, format);
      const successVerb = source === 'url' ? 'Successfully downloaded' : 'Generated and downloaded';
      toast.success(`${successVerb} ${String(normalizedFormat || displayFormat).toUpperCase()}`, { id: 'export' });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Export failed: ${error.message}`, { id: 'export' });
    }
  };

  if (isLoading || !bookData) {
    return (
      <div className="flex justify-center items-center h-screen w-screen" style={{ background: 'var(--color-background)'}}>
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p>Error loading book: {error}</p>
        <button onClick={() => navigate('/app/books')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Back to Library
        </button>
      </div>
    );
  }

  return (
    <FullScreenReader 
      htmlContent={htmlContent} 
      // The onClose button now correctly navigates back to the main books library page.
      onClose={() => navigate('/app/books')} 
      book={bookData}
      onUnifiedExport={handleUnifiedExport} 
    />
  );
};

export default BookReader;
