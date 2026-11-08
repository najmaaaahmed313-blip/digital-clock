import { useEffect, useState } from 'react'
import './App.css'

const pad = (value) => String(value).padStart(2, '0')

function getClockData(date) {
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  const color = `#${hours}${minutes}${seconds}`
  const red = Number.parseInt(hours, 16)
  const green = Number.parseInt(minutes, 16)
  const blue = Number.parseInt(seconds, 16)
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000

  return {
    hours,
    minutes,
    seconds,
    color,
    brightness,
    dateLabel: new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date),
  }
}

function App() {
  const [now, setNow] = useState(() => new Date())
  const [copied, setCopied] = useState(false)
  const clock = getClockData(now)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  async function copyColor() {
    try {
      await navigator.clipboard.writeText(clock.color)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main
      className={`clock${clock.brightness > 145 ? ' clock--light' : ''}`}
      style={{ backgroundColor: clock.color }}
    >
      <header className="clock__topline">
        <a className="wordmark" href="#" aria-label="Color Clock home">
          <span className="wordmark__dot" />
          COLOR / TIME
        </a>
        <span className="clock__timezone">LOCAL TIME</span>
      </header>

      <section className="clock__face" aria-label="Current time and color">
        <p className="clock__eyebrow">A different shade, every second</p>
        <h1 className="clock__digits" aria-label={`${clock.hours}:${clock.minutes}:${clock.seconds}`}>
          <span>{clock.hours}</span>
          <span className="clock__colon">:</span>
          <span>{clock.minutes}</span>
          <span className="clock__colon">:</span>
          <span>{clock.seconds}</span>
        </h1>
        <div className="clock__color-line">
          <span className="clock__color-label">CURRENT COLOR</span>
          <span className="clock__hex">{clock.color}</span>
          <button className="copy-button" onClick={copyColor} type="button">
            <span className="copy-button__icon" aria-hidden="true">{copied ? '✓' : '+'}</span>
            {copied ? 'COPIED' : 'COPY HEX'}
          </button>
        </div>
        <p className="clock__date">{clock.dateLabel}</p>
      </section>

      <footer className="clock__footer">
        <span>TIME, TRANSLATED INTO COLOR.</span>
        <span className="clock__coordinates" aria-hidden="true">
          {clock.hours}° {clock.minutes}' {clock.seconds}"
        </span>
        <span>H · M · S / RGB</span>
      </footer>
    </main>
  )
}

export default App
