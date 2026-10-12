import { useCallback, useEffect, useRef, useState } from 'react'
import { removeBackground } from '@imgly/background-removal'

export default function App() {
  const [file, setFile] = useState(null)
  const [originalUrl, setOriginalUrl] = useState(null)
  const [resultUrl, setResultUrl] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    fileRef.current = file
  }, [file])

  const clearUrls = useCallback(() => {
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
  }, [originalUrl, resultUrl])

  useEffect(() => {
    return () => clearUrls()
  }, [clearUrls])

  const handleFile = useCallback(
    (selected) => {
      if (!selected) return
      if (!selected.type.startsWith('image/')) {
        setError('Please choose an image file (PNG, JPG, WebP...).')
        return
      }
      clearUrls()
      setError(null)
      setFile(selected)
      setOriginalUrl(URL.createObjectURL(selected))
      setResultUrl(null)
      setProgress(0)
    },
    [clearUrls],
  )

  const processImage = useCallback(async () => {
    const image = fileRef.current
    if (!image) return
    setProcessing(true)
    setError(null)
    setProgress(0)
    try {
      const blob = await removeBackground(image, {
        progress: (_, current, total) => {
          const pct = total > 0 ? Math.round((current / total) * 100) : 0
          setProgress(Math.min(pct, 100))
        },
      })
      setResultUrl(URL.createObjectURL(blob))
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Something went wrong while removing the background.')
    } finally {
      setProcessing(false)
    }
  }, [])

  const download = useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `background-removed-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }, [resultUrl])

  const reset = useCallback(() => {
    clearUrls()
    setFile(null)
    setOriginalUrl(null)
    setResultUrl(null)
    setError(null)
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }, [clearUrls])

  return (
    <main className="app">
      <header className="header">
        <h1>Background Remover</h1>
        <p>Drop an image, remove its background, and download a clean PNG.</p>
      </header>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {!file ? (
        <div
          className={`dropzone ${dragging ? 'drag' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setDragging(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFile(e.dataTransfer.files?.[0])
          }}
        >
          <svg
            className="dropzone-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 16V4m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" />
          </svg>
          <p className="dropzone-title">Drag &amp; drop an image here</p>
          <p className="dropzone-sub">or click to browse from your computer</p>
        </div>
      ) : (
        <section className="workspace">
          <div className="preview">
            <figure>
              <figcaption>Original</figcaption>
              <div className="frame solid">
                <img src={originalUrl} alt="Original" />
              </div>
            </figure>
            <figure>
              <figcaption>Transparent PNG</figcaption>
              <div className="frame checker">
                {resultUrl ? (
                  <img src={resultUrl} alt="Result" />
                ) : (
                  <span className="placeholder">
                    {processing ? `Processing... ${progress}%` : 'Not processed yet'}
                  </span>
                )}
              </div>
            </figure>
          </div>

          {processing && (
            <div className="progress">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
          )}

          {error && <p className="error">{error}</p>}

          <div className="actions">
            {!processing && (
              <button type="button" className="btn" onClick={() => inputRef.current?.click()}>
                Change image
              </button>
            )}
            {!processing && !resultUrl && (
              <button type="button" className="btn primary" onClick={processImage}>
                Remove background
              </button>
            )}
            {!processing && resultUrl && (
              <button type="button" className="btn primary" onClick={download}>
                Download PNG
              </button>
            )}
            {!processing && (resultUrl || file) && (
              <button type="button" className="btn ghost" onClick={reset}>
                Start over
              </button>
            )}
          </div>
        </section>
      )}
    </main>
  )
}