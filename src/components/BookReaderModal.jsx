import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion'; // AnimatePresence is no longer needed here
import { X, Maximize } from 'lucide-react';
import BookThemeToggle from './BookThemeToggle'; // Import the new toggle
import './../styles/BookReaderModal.css'; // Import the new stylesheet
import '../styles/BookReaderTheme.css'; // Import the new theme styles

const BookReaderModal = ({ book, htmlContent, onClose, onGoFullScreen }) => {
  const [readerTheme, setReaderTheme] = useState(() => {
    return localStorage.getItem('lekhika-reader-theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('lekhika-reader-theme', readerTheme);
  }, [readerTheme]);

  const toggleReaderTheme = () => {
    setReaderTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!book) return null;

  const modalContent = (
    <motion.div
      className="book-reader-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`book-reader-modal-content ${readerTheme === 'light' ? 'reader-theme-light' : 'reader-theme-dark'}`}
        initial={{ y: 50, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 50, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        <header 
          className="flex-shrink-0 flex items-center justify-between p-4"
          style={{ 
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)'
          }}
        >
          <div className="flex items-center gap-2">
            <BookThemeToggle theme={readerTheme} onToggle={toggleReaderTheme} />
          </div>
          <div className="text-center flex-1">
            <h2 className="text-xl font-bold">{book.title}</h2>
            {/* SURGICAL STRIKE: Annihilate the shitty low-contrast color. */}
            <p>by {book.author || 'Lekhika AI'}</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onGoFullScreen}>
              <Maximize size={20} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}>
              <X size={24} />
            </motion.button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 md:p-12 book-content">
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      </motion.div>
    </motion.div>
  );

  if (typeof document === 'undefined') {
    return modalContent;
  }

  return createPortal(modalContent, document.body);
};

export default BookReaderModal;
