'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Trash2, ExternalLink } from 'lucide-react'

interface Bookmark {
  id: string
  title: string
  url: string
  created_at: string
}

export default function BookmarkList({ userId }: { userId: string }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchBookmarks = async () => {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching bookmarks:', error)
      } else {
        setBookmarks(data || [])
      }
      setLoading(false)
    }

    fetchBookmarks()

    // Realtime subscription
    const channel = supabase
      .channel('bookmarks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookmarks((prev) => [payload.new as Bookmark, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setBookmarks((prev) =>
              prev.map((b) => (b.id === payload.new.id ? (payload.new as Bookmark) : b))
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const deleteBookmark = async (id: string) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id)
    if (error) {
      alert('Error deleting bookmark: ' + error.message)
    }
  }

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading bookmarks...</div>
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg text-gray-500">
        No bookmarks yet. Add one above!
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-all bg-white group"
        >
          <div className="flex-1 min-w-0 mr-4">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {bookmark.title}
            </h3>
            <p className="text-sm text-gray-500 truncate flex items-center">
              <span className="truncate">{bookmark.url}</span>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-500 hover:text-blue-700 inline-flex"
              >
                <ExternalLink size={14} />
              </a>
            </p>
          </div>
          <button
            onClick={() => deleteBookmark(bookmark.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Delete bookmark"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ))}
    </div>
  )
}
