import { useLoader } from '../context/LoaderContext'

export default function GlobalLoader() {
  const { isLoading } = useLoader()

  if (!isLoading) {
    return null
  }

  return <div className="global-loader">Loading...</div>
}
