import { supabase } from '../lib/supabase'
import googleCloudStorageService from './googleCloudStorageService'

class StorageService {
  constructor() {
    this.storageType = localStorage.getItem('lekhika-storage-preference') || 'local' // 'local', 'cloud', or 'google_cloud'
    this.maxLocalStorageSize = 50 * 1024 * 1024 // 50MB limit for IndexedDB
  }

  // Set storage preference
  setStoragePreference(type) {
    this.storageType = type
    localStorage.setItem('lekhika-storage-preference', type)
  }

  // Get storage preference
  getStoragePreference() {
    return this.storageType
  }

  // Get storage info for UI
  getStorageInfo() {
    if (this.storageType === 'local') {
      return {
        type: 'local',
        name: 'Privacy-First Storage',
        description: 'Files stored locally on your device only',
        benefits: ['Complete privacy', 'No data leaves your device', 'Instant access', 'No storage costs'],
        icon: '🔒',
        color: 'green'
      }
    } else if (this.storageType === 'google_cloud') {
      return googleCloudStorageService.getStorageInfo()
    } else {
      return {
        type: 'cloud',
        name: 'Supabase Storage',
        description: 'Files stored securely in Supabase cloud',
        benefits: ['Access from any device', 'Automatic backup', 'Larger storage capacity', 'Team sharing'],
        icon: '☁️',
        color: 'blue'
      }
    }
  }

  // Upload file using selected storage method
  async uploadFile(file, metadata = {}) {
    try {
      if (this.storageType === 'local') {
        return await this.uploadToLocalStorage(file, metadata)
      } else if (this.storageType === 'google_cloud') {
        return await googleCloudStorageService.uploadFile(file, metadata)
      } else {
        return await this.uploadToCloud(file, metadata)
      }
    } catch (error) {
      console.error('File upload error:', error)
      throw new Error(`Failed to upload file: ${error.message}`)
    }
  }

  // Upload to localStorage/IndexedDB
  async uploadToLocalStorage(file, metadata) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (event) => {
        try {
          const fileData = {
            id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            data: event.target.result, // Base64 data
            metadata: metadata,
            uploadedAt: new Date().toISOString(),
            storageType: 'local'
          }

          // Store in IndexedDB
          await this.storeInIndexedDB(fileData)
          
          resolve({
            id: fileData.id,
            name: file.name,
            type: file.type,
            size: file.size,
            url: `local://${fileData.id}`, // Local reference
            uploadedAt: fileData.uploadedAt,
            storageType: 'local'
          })
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  // Upload to Supabase Storage
  async uploadToCloud(file, metadata) {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Generate unique filename
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `${userId}/${timestamp}_${sanitizedName}`
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('user-references')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-references')
        .getPublicUrl(fileName)

      // Store metadata in database
      const { data: dbData, error: dbError } = await supabase
        .from('user_references')
        .insert({
          user_id: userId,
          name: file.name,
          description: metadata.description || '',
          file_type: file.type,
          file_size: file.size,
          file_path: fileName,
          content_summary: metadata.summary || '',
          upload_date: new Date().toISOString()
        })
        .select()
        .single()

      if (dbError) throw dbError

      return {
        id: dbData.id,
        name: file.name,
        type: file.type,
        size: file.size,
        url: urlData.publicUrl,
        uploadedAt: dbData.upload_date,
        storageType: 'cloud',
        dbId: dbData.id
      }
    } catch (error) {
      console.error('Cloud upload error:', error)
      throw error
    }
  }

  // Get all uploaded files
  async getFiles() {
    try {
      if (this.storageType === 'local') {
        return await this.getLocalFiles()
      } else if (this.storageType === 'google_cloud') {
        return await googleCloudStorageService.getFiles()
      } else {
        return await this.getCloudFiles()
      }
    } catch (error) {
      console.error('Error fetching files:', error)
      return []
    }
  }

  // Get local files from IndexedDB
  async getLocalFiles() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('lekhika-files', 1)
      
      request.onerror = () => reject(new Error('Failed to open IndexedDB'))
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' })
        }
      }
      
      request.onsuccess = (event) => {
        const db = event.target.result
        const transaction = db.transaction(['files'], 'readonly')
        const store = transaction.objectStore('files')
        const getAllRequest = store.getAll()
        
        getAllRequest.onsuccess = () => {
          const files = getAllRequest.result.map(file => ({
            id: file.id,
            name: file.name,
            type: file.type,
            size: file.size,
            url: `local://${file.id}`,
            uploadedAt: file.uploadedAt,
            storageType: 'local'
          }))
          resolve(files)
        }
        
        getAllRequest.onerror = () => reject(new Error('Failed to get files'))
      }
    })
  }

  // Get cloud files from Supabase
  async getCloudFiles() {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) {
        return []
      }

      const { data, error } = await supabase
        .from('user_references')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('upload_date', { ascending: false })

      if (error) throw error

      return data.map(file => ({
        id: file.id,
        name: file.name,
        type: file.file_type,
        size: file.file_size,
        url: supabase.storage.from('user-references').getPublicUrl(file.file_path).data.publicUrl,
        uploadedAt: file.upload_date,
        storageType: 'cloud',
        description: file.description,
        summary: file.content_summary
      }))
    } catch (error) {
      console.error('Error fetching cloud files:', error)
      return []
    }
  }

  // Delete file
  async deleteFile(fileId) {
    try {
      if (this.storageType === 'local') {
        return await this.deleteLocalFile(fileId)
      } else if (this.storageType === 'google_cloud') {
        return await googleCloudStorageService.deleteFile(fileId)
      } else {
        return await this.deleteCloudFile(fileId)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  // Delete local file
  async deleteLocalFile(fileId) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('lekhika-files', 1)
      
      request.onsuccess = (event) => {
        const db = event.target.result
        const transaction = db.transaction(['files'], 'readwrite')
        const store = transaction.objectStore('files')
        const deleteRequest = store.delete(fileId)
        
        deleteRequest.onsuccess = () => resolve()
        deleteRequest.onerror = () => reject(new Error('Failed to delete file'))
      }
      
      request.onerror = () => reject(new Error('Failed to open IndexedDB'))
    })
  }

  // Delete cloud file
  async deleteCloudFile(fileId) {
    try {
      // Get file info first
      const { data: fileData, error: fetchError } = await supabase
        .from('user_references')
        .select('file_path')
        .eq('id', fileId)
        .single()

      if (fetchError) throw fetchError

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('user-references')
        .remove([fileData.file_path])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_references')
        .update({ is_active: false })
        .eq('id', fileId)

      if (dbError) throw dbError

      return true
    } catch (error) {
      console.error('Error deleting cloud file:', error)
      throw error
    }
  }

  // Get file content (for local files)
  async getFileContent(fileId) {
    if (this.storageType === 'local') {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('lekhika-files', 1)
        
        request.onsuccess = (event) => {
          const db = event.target.result
          const transaction = db.transaction(['files'], 'readonly')
          const store = transaction.objectStore('files')
          const getRequest = store.get(fileId)
          
          getRequest.onsuccess = () => {
            if (getRequest.result) {
              resolve(getRequest.result.data)
            } else {
              reject(new Error('File not found'))
            }
          }
          
          getRequest.onerror = () => reject(new Error('Failed to get file'))
        }
        
        request.onerror = () => reject(new Error('Failed to open IndexedDB'))
      })
    } else {
      // For cloud files, return the URL
      const files = await this.getCloudFiles()
      const file = files.find(f => f.id === fileId)
      return file ? file.url : null
    }
  }

  // Store in IndexedDB
  async storeInIndexedDB(fileData) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('lekhika-files', 1)
      
      request.onerror = () => reject(new Error('Failed to open IndexedDB'))
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' })
        }
      }
      
      request.onsuccess = (event) => {
        const db = event.target.result
        const transaction = db.transaction(['files'], 'readwrite')
        const store = transaction.objectStore('files')
        const addRequest = store.add(fileData)
        
        addRequest.onsuccess = () => resolve()
        addRequest.onerror = () => reject(new Error('Failed to store file'))
      }
    })
  }

  // Get storage usage stats
  async getStorageStats() {
    if (this.storageType === 'local') {
      const files = await this.getLocalFiles()
      const totalSize = files.reduce((sum, file) => sum + file.size, 0)
      return {
        totalFiles: files.length,
        totalSize: totalSize,
        maxSize: this.maxLocalStorageSize,
        usagePercent: (totalSize / this.maxLocalStorageSize) * 100
      }
    } else {
      const files = await this.getCloudFiles()
      const totalSize = files.reduce((sum, file) => sum + file.size, 0)
      return {
        totalFiles: files.length,
        totalSize: totalSize,
        maxSize: 1024 * 1024 * 1024, // 1GB limit for cloud
        usagePercent: (totalSize / (1024 * 1024 * 1024)) * 100
      }
    }
  }
}

// Export singleton instance
export const storageService = new StorageService()
export default storageService
