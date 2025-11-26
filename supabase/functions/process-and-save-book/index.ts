// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log(`🚀 Master Formatter function booting up!`)

const supabaseUrl = Deno.env.get('SUPABASE_URL')
if (!supabaseUrl) {
  console.error('FATAL: SUPABASE_URL is not set.')
}

const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
if (!supabaseAnonKey) {
  console.error('FATAL: SUPABASE_ANON_KEY is not set.')
}

const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
if (!supabaseServiceRoleKey) {
  console.error('FATAL: SUPABASE_SERVICE_ROLE_KEY is not set.')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const responseHeaders = {
    ...corsHeaders,
    'Content-Type': 'application/json'
  }

  try {
    const body = await req.json()
    const bookId = body?.bookId

    if (!bookId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required parameter: bookId'
      }), { status: 400, headers: responseHeaders })
    }

    console.log(`[Job ${bookId}] Verifying persisted book assets...`)

    const { data: book, error: fetchError } = await supabaseAdmin
      .from('books')
      .select('id, user_id, status, title, format_urls, output_formats, metadata')
      .eq('id', bookId)
      .single()

    if (fetchError || !book) {
      return new Response(JSON.stringify({
        success: false,
        error: fetchError?.message || 'Book not found'
      }), { status: 404, headers: responseHeaders })
    }

    const formatUrls = book.format_urls || {}
    const availableFormats = Object.entries(formatUrls)
      .filter(([_, url]) => !!url)
      .map(([format]) => format)

    if (!availableFormats.length) {
      console.warn(`[Job ${bookId}] No stored formats detected yet.`)
      return new Response(JSON.stringify({
        success: false,
        error: 'No stored formats available for this book yet.'
      }), { status: 409, headers: responseHeaders })
    }

    if (book.status !== 'completed' || !book.output_formats || book.output_formats.length !== availableFormats.length) {
      const updatedMetadata = {
        ...(book.metadata || {}),
        formats: availableFormats,
        published_at: new Date().toISOString()
      }

      const { error: updateError } = await supabaseAdmin
        .from('books')
        .update({
          status: 'completed',
          output_formats: availableFormats,
          metadata: updatedMetadata
        })
        .eq('id', bookId)

      if (updateError) {
        console.error(`[Job ${bookId}] Failed to update book record:`, updateError)
      } else {
        console.log(`[Job ${bookId}] Book record marked as completed.`)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      bookId,
      formatUrls,
      outputFormats: availableFormats
    }), { status: 200, headers: responseHeaders })
  } catch (error) {
    console.error('process-and-save-book error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500, headers: responseHeaders })
  }
})
