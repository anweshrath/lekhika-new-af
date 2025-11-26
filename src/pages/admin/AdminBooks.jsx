import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Search, 
  Filter, 
  MoreVertical, 
  Download,
  Eye,
  Trash2,
  Calendar,
  User,
  FileText
} from 'lucide-react'
import { dbService } from '../../services/database'
import toast from 'react-hot-toast'
import ErrorBoundary from '../../components/ErrorBoundary'

const AdminBooks = () => {
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    try {
      filterBooks()
    } catch (err) {
      console.error('Error filtering books:', err)
      setError(err.message)
    }
  }, [books, searchTerm, filterStatus, filterType])

  const loadData = async () => {
    try {
      setError(null)
      console.log('Loading data...')
      
      // Ensure database is initialized
      if (!dbService.db) {
        console.log('Initializing database...')
        await dbService.init()
      }
      
      console.log('Fetching books and users...')
      const [allBooks, allUsers] = await Promise.all([
        dbService.getBooks().catch(err => {
          console.error('Error fetching books:', err)
          return []
        }),
        dbService.getUsers().catch(err => {
          console.error('Error fetching users:', err)
          return []
        })
      ])
      
      console.log('Books loaded:', allBooks?.length || 0)
      console.log('Users loaded:', allUsers?.length || 0)
      
      setBooks(Array.isArray(allBooks) ? allBooks : [])
      setUsers(Array.isArray(allUsers) ? allUsers : [])
    } catch (error) {
      console.error('Error loading data:', error)
      setError(error.message)
      toast.error('Failed to load data: ' + error.message)
      setBooks([])
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const filterBooks = () => {
    try {
      if (!Array.isArray(books)) {
        console.warn('Books is not an array:', books)
        setFilteredBooks([])
        return
      }

      let filtered = [...books]

      if (searchTerm && searchTerm.trim()) {
        filtered = filtered.filter(book => {
          if (!book) return false
          const title = (book.title || '').toLowerCase()
          const niche = (book.niche || '').toLowerCase()
          const search = searchTerm.toLowerCase()
          return title.includes(search) || niche.includes(search)
        })
      }

      if (filterStatus !== 'all') {
        filtered = filtered.filter(book => book && book.status === filterStatus)
      }

      if (filterType !== 'all') {
        filtered = filtered.filter(book => book && book.type === filterType)
      }

      setFilteredBooks(filtered)
    } catch (err) {
      console.error('Error in filterBooks:', err)
      setFilteredBooks([])
    }
  }

  const getUserName = (userId) => {
    try {
      if (!Array.isArray(users) || !userId) return 'Unknown User'
      const user = users.find(u => u && u.id === userId)
      return user ? (user.name || 'Unknown User') : 'Unknown User'
    } catch (err) {
      console.error('Error getting user name:', err)
      return 'Unknown User'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'generating':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const deleteBook = async (bookId) => {
    if (!bookId) return
    
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await dbService.deleteBook(bookId)
        setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId))
        toast.success('Book deleted successfully')
      } catch (error) {
        console.error('Error deleting book:', error)
        toast.error('Failed to delete book: ' + error.message)
      }
    }
  }

  const getStatsValue = (filterFn) => {
    try {
      if (!Array.isArray(books)) return 0
      return books.filter(book => book && filterFn(book)).length
    } catch (err) {
      console.error('Error calculating stats:', err)
      return 0
    }
  }

  const getThisMonthBooks = () => {
    try {
      if (!Array.isArray(books)) return 0
      return books.filter(book => {
        if (!book || !book.createdAt) return false
        try {
          const bookDate = new Date(book.createdAt)
          const now = new Date()
          return bookDate.getMonth() === now.getMonth() && bookDate.getFullYear() === now.getFullYear()
