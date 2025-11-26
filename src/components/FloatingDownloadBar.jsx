import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, X, Loader2 } from 'lucide-react';

const FloatingDownloadBar = ({ book, onExport }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [exportingFormat, setExportingFormat] = useState(null);

  const handleExport = async (format) => {
    setExportingFormat(format);
    try {
      await onExport(book, format);
    } finally {
      setExportingFormat(null);
    }
  };
  
  const availableFormats = Array.from(new Set([
    ...(Array.isArray(book.output_formats) ? book.output_formats : []),
    ...(Array.isArray(book?.metadata?.formats) ? book.metadata.formats : []),
    ...Object.keys(book.format_urls || {})
  ]))
    .map((format) => String(format).toLowerCase())
    .filter(Boolean);

  const formatIcons = {
    pdf: '📄',
    epub: '📚',
    docx: '📝',
    html: '🌐',
    txt: '🗒️',
  };

  if (!isExpanded) {
    return (
      <motion.div 
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <motion.button
          onClick={() => setIsExpanded(true)}
          className="p-4 rounded-full shadow-lg"
          style={{ background: 'var(--theme-primary)', color: 'var(--color-on-primary)' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download size={24} />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed bottom-8 right-8 z-50 p-4 rounded-2xl shadow-2xl"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text)',
      }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-lg">Download Formats</h4>
        <motion.button 
          onClick={() => setIsExpanded(false)} 
          className="p-1 rounded-full"
          style={{ color: 'var(--color-text-muted)' }}
          whileHover={{ scale: 1.1, background: 'var(--color-surface-hover)' }} 
          whileTap={{ scale: 0.95 }}
        >
          <X size={20} />
        </motion.button>
      </div>
      <div className="flex gap-3">
        {availableFormats.length === 0 ? (
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            No downloadable formats yet.
          </span>
        ) : (
          availableFormats.map(format => (
            <motion.button
              key={format}
              onClick={() => handleExport(format)}
              disabled={!!exportingFormat}
              className="relative flex flex-col items-center gap-2 p-3 rounded-lg transition-colors disabled:opacity-50"
              style={{ background: 'var(--color-surface-hover)'}}
              whileHover={{ y: -5, background: 'var(--color-surface-raised)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-3xl">{formatIcons[format] || '💾'}</span>
              <span className="font-semibold text-sm uppercase">{format}</span>
              {exportingFormat === format && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <Loader2 className="animate-spin" style={{ color: 'var(--color-on-primary)' }}/>
                </div>
              )}
            </motion.button>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default FloatingDownloadBar;
