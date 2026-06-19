import { useState, useEffect, useRef } from 'react'
import type { Item } from '../types'
import { searchItems } from '../services/mockApi'

export interface UseSearchReturn {
  query: string
  setQuery: (q: string) => void
  results: Item[]
  isLoading: boolean
  error: string | null
}

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Prevent stale responses
  const requestIdRef = useRef(0)

  // Prevent state updates after unmount
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const currentRequestId = ++requestIdRef.current

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await searchItems(query)

        // Ignore stale responses
        if (
          !mountedRef.current ||
          currentRequestId !== requestIdRef.current
        ) {
          return
        }

        setResults(data)
      } catch {
        if (
          !mountedRef.current ||
          currentRequestId !== requestIdRef.current
        ) {
          return
        }

        setError('Failed to search items')
        setResults([])
      } finally {
        if (
          mountedRef.current &&
          currentRequestId === requestIdRef.current
        ) {
          setIsLoading(false)
        }
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
  }
}
