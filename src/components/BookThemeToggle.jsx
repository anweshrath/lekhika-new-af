import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const BookThemeToggle = ({ theme, onToggle }) => {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="p-2 rounded-full"
      style={{ color: 'var(--color-text)' }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} reading mode`}
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </motion.button>
  );
};

export default BookThemeToggle;
