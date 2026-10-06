import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

interface LoaderContextValue {
  isLoading: boolean
  showLoader: () => void
  hideLoader: () => void
}

const LoaderContext = createContext<LoaderContextValue | undefined>(undefined)

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(0)

  const showLoader = useCallback(() => setLoadingCount((count) => count + 1), [])
  const hideLoader = useCallback(() => setLoadingCount((count) => Math.max(0, count - 1)), [])

  const value = useMemo(
    () => ({
      isLoading: loadingCount > 0,
      showLoader,
      hideLoader,
    }),
    [loadingCount, showLoader, hideLoader],
  )

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>
}

export function useLoader() {
  const context = useContext(LoaderContext)

  if (!context) {
    throw new Error('useLoader must be used inside LoaderProvider')
  }

  return context
}
