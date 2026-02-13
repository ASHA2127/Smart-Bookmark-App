'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function BookmarkForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('bookmarks').insert([
      {
        title,
        url,
        user_id: userId,
      },
    ])

    if (error) {
      alert(error.message)
    } else {
      setTitle('')
      setUrl('')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="My favorite site"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="https://example.com"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Adding...' : 'Add Bookmark'}
      </button>
    </form>
  )
}
