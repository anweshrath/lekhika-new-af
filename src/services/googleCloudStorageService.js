import { supabase } from '../lib/supabase'

class GoogleCloudStorageService {
  constructor() {
    this.bucketName = import.meta.env.VITE_GCS_BUCKET_NAME || 'lekhika-user-files'
    this.projectId = import.meta.env.VITE_GCS_PROJECT_ID
    this.maxFileSize = 10 * 1024 * 1024 // 10MB limit
    this.allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ]
  }

  // Validate file before upload
  validateFile(file) {
    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`)
    }
    
    if (!this.allowedMimeTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`)
    }
    
    return true
  }

  // Generate signed URL for direct upload to GCS
  async generateSignedUploadUrl(fileName, fileType, userId) {
    try {
      // Call your backend API to generate signed URL
      // This should be done server-side for security
      const response = await fetch('/api/gcs/generate-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          fileName,
          fileType,
          userId,
          bucketName: this.bucketName
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to generate upload URL: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        uploadUrl: data.uploadUrl,
        publicUrl: data.publicUrl,
        fileName: data.fileName
      }
    } catch (error) {
      console.error('Error generating signed URL:', error)
      throw new Error(`Failed to generate upload URL: ${error.message}`)
    }
  }

  // Upload file directly to Google Cloud Storage
  async uploadFile(file, metadata = {}) {
    try {
      this.validateFile(file)
      
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Generate unique filename
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `${userId}/${timestamp}_${sanitizedName}`

      // Get signed upload URL from backend
      const { uploadUrl, publicUrl, fileName: finalFileName } = await this.generateSignedUploadUrl(
        fileName,
        file.type,
        userId
      )

      // Upload directly to GCS using signed URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      })

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`)
      }

      // Store metadata in database
      const { data: dbData, error: dbError } = await supabase
        .from('user_references')
        .insert({
          user_id: userId,
          name: file.name,
          description: metadata.description || '',
          file_type: file.type,
          file_size: file.size,
          file_path: finalFileName,
          content_summary: metadata.summary || '',
          upload_date: new Date().toISOString(),
          storage_provider: 'google_cloud'
        })
        .select()
        .single()

      if (dbError) throw dbError

      return {
        id: dbData.id,
        name: file.name,
        type: file.type,
        size: file.size,
        url: publicUrl, // This will be a signed URL for private access
        uploadedAt: dbData.upload_date,
        storageType: 'google_cloud',
        dbId: dbData.id,
        fileName: finalFileName
      }
    } catch (error) {
      console.error('GCS upload error:', error)
      throw error
    }
  }

  // Get signed URL for file access (private bucket)
  async getSignedAccessUrl(fileName, userId) {
    try {
      const response = await fetch('/api/gcs/generate-access-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          fileName,
          userId,
          bucketName: this.bucketName
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to generate access URL: ${response.statusText}`)
      }

      const data = await response.json()
      return data.accessUrl
    } catch (error) {
      console.error('Error generating access URL:', error)
      throw error
    }
  }

  // Get all files for user
  async getFiles() {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) {
        return []
      }

      const { data, error } = await supabase
        .from('user_references')
        .select('*')
        .eq('user_id', userId)
        .eq('storage_provider', 'google_cloud')
        .eq('is_active', true)
        .order('upload_date', { ascending: false })

      if (error) throw error

      // Generate signed URLs for each file
      const filesWithUrls = await Promise.all(
        data.map(async (file) => {
          try {
            const accessUrl = await this.getSignedAccessUrl(file.file_path, userId)
            return {
              id: file.id,
              name: file.name,
              type: file.file_type,
              size: file.file_size,
              url: accessUrl,
              uploadedAt: file.upload_date,
              storageType: 'google_cloud',
              description: file.description,
              summary: file.content_summary
            }
          } catch (error) {
            console.error(`Error getting access URL for ${file.name}:`, error)
            return {
              id: file.id,
              name: file.name,
              type: file.file_type,
              size: file.file_size,
              url: null,
              uploadedAt: file.upload_date,
              storageType: 'google_cloud',
              description: file.description,
              summary: file.content_summary,
              error: 'Access URL generation failed'
            }
          }
        })
      )

      return filesWithUrls
    } catch (error) {
      console.error('Error fetching GCS files:', error)
      return []
    }
  }

  // Delete file from GCS and database
  async deleteFile(fileId) {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Get file info from database
      const { data: fileData, error: fetchError } = await supabase
        .from('user_references')
        .select('file_path')
        .eq('id', fileId)
        .eq('user_id', userId)
        .single()

      if (fetchError) throw fetchError

      // Delete from Google Cloud Storage
      const deleteResponse = await fetch('/api/gcs/delete-file', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          fileName: fileData.file_path,
          bucketName: this.bucketName
        })
      })

      if (!deleteResponse.ok) {
        console.warn(`Failed to delete file from GCS: ${deleteResponse.statusText}`)
      }

      // Mark as inactive in database
      const { error: dbError } = await supabase
        .from('user_references')
        .update({ is_active: false })
        .eq('id', fileId)

      if (dbError) throw dbError

      return true
    } catch (error) {
      console.error('Error deleting GCS file:', error)
      throw error
    }
  }

  // Get authentication token
  async getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  // Get storage info for UI
  getStorageInfo() {
    return {
      type: 'google_cloud',
      name: 'Google Cloud Storage',
      description: 'Secure, scalable cloud storage with Google infrastructure',
      benefits: [
        'Enterprise-grade security',
        'Global CDN for fast access',
        'Advanced AI integration',
        'Cost-effective pricing'
      ],
      icon: '🔵',
      color: 'blue',
      provider: 'Google Cloud'
    }
  }

  // Get storage usage stats
  async getStorageStats() {
    try {
      const files = await this.getFiles()
      const totalSize = files.reduce((sum, file) => sum + file.size, 0)
      return {
        totalFiles: files.length,
        totalSize: totalSize,
        maxSize: 1024 * 1024 * 1024, // 1GB limit
        usagePercent: (totalSize / (1024 * 1024 * 1024)) * 100,
        provider: 'Google Cloud Storage'
      }
    } catch (error) {
      console.error('Error getting GCS stats:', error)
      return {
        totalFiles: 0,
        totalSize: 0,
        maxSize: 1024 * 1024 * 1024,
        usagePercent: 0,
        provider: 'Google Cloud Storage'
      }
    }
  }
}

// Export singleton instance
export const googleCloudStorageService = new GoogleCloudStorageService()
export default googleCloudStorageService
