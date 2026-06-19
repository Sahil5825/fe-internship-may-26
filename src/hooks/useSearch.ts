import { useState, useEffect, useRef } from 'react'
import { searchItems } from '../services/mockApi'
import type { Item } from '../types'

// Uncomment this import when you are ready to wire up the search logic:
// import { searchItems } from '../services/mockApi'

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

 const requestIdRef = useRef(0)
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

      if (
        !mountedRef.current ||
        currentRequestId !== requestIdRef.current
      ) {
        return
      }

      setResults(data)
    } catch (err) {
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

  return { query, setQuery, results, isLoading, error }
}
