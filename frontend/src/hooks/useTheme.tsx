import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return localStorage.getItem('logistics-ui-theme') === 'dark' ? 'dark' : 'light' }
    catch { return 'light' }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('logistics-ui-theme', theme) } catch { /* theme still applies for this page */ }
  }, [theme])

  return { theme, toggleTheme: () => setTheme((current) => current === 'light' ? 'dark' : 'light') }
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const nextTheme = theme === 'light' ? 'dark' : 'light'
  return <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${nextTheme} theme`} aria-pressed={theme === 'dark'} title={`Switch to ${nextTheme} theme`}>
    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
    <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
  </button>
}
