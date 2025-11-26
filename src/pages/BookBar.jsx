import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, DownloadCloud, Trash2, PlusCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

import { useUserAuth } from '../contexts/UserAuthContext';
import dbService from '../services/database';
import { supabase } from '../lib/supabase';
import '../styles/Books.css';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const userBooks = await dbService.getBooks(user.id);
        setBooks(userBooks || []);
      } catch (err) {
        setError('Failed to fetch books. Please try again later.');
        toast.error('Could not load your library.');
        console.error("Fetch books error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [user]);

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to permanently delete this book?')) {
      try {
        await dbService.deleteBook(bookId);
        setBooks(books.filter(b => b.id !== bookId));
        toast.success('Book deleted successfully.');
      } catch (err) {
        toast.error('Failed to delete book.');
        console.error("Delete book error:", err);
      }
    }
  };

  const handleDownload = (book, format) => {
    // This will be implemented next with the new, from-scratch reader.
    console.log(`Placeholder: Download ${book.title} as ${format}`);
    toast.info(`Download for ${format.toUpperCase()} will be implemented next.`);
  };

  const renderEmptyState = () => (
    <div className="empty-state-container">
      <h2 className="text-3xl font-bold mb-4">Your Library is Empty</h2>
      <p className="text-lg mb-8">Create your first masterpiece to see it here.</p>
      <motion.button 
        className="create-book-button"
        onClick={() => navigate('/app/create-book')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <PlusCircle className="mr-2" />
        Create a New Book
      </motion.button>
    </div>
  );

  const renderErrorState = () => (
     <div className="error-state-container">
      <AlertTriangle size={48} className="mb-4 text-red-500" />
      <h2 className="text-3xl font-bold mb-4">Error Loading Library</h2>
      <p className="text-lg">{error}</p>
    </div>
  );

  return (
    <motion.div 
      className="books-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="books-header">
        <h1 className="text-4xl font-bold">My Books</h1>
      </header>
      
      {loading && <div className="loading-spinner"></div>}
      
      {!loading && !error && books.length === 0 && renderEmptyState()}
      
      {error && renderErrorState()}

      <AnimatePresence>
        <div className="books-grid">
          {books.map((book, index) => (
            <motion.div 
              key={book.id}
              className="book-card"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="book-card-cover" onClick={() => navigate(`/app/books/read/${book.id}`)}>
                <h3 className="book-card-title">{book.title}</h3>
                <p className="book-card-author">by {book.author || 'Lekhika AI'}</p>
              </div>
              <div className="book-card-actions">
                <motion.button onClick={() => navigate(`/app/books/read/${book.id}`)} title="View Book" whileHover={{ scale: 1.1 }}>
                  <Eye />
                </motion.button>
                <motion.button onClick={() => handleDownload(book, 'pdf')} title="Download" whileHover={{ scale: 1.1 }}>
                  <DownloadCloud />
                </motion.button>
                <motion.button onClick={() => handleDelete(book.id)} title="Delete Book" whileHover={{ scale: 1.1 }}>
                  <Trash2 />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Books;