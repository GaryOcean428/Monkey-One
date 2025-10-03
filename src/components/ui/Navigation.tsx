import React, { useState } from 'react'
import { Link } from 'react-router'
import { Icons } from './icons'
import { Button } from './button'

const Navigation: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.body.classList.toggle('dark-mode', !isDarkMode)
  }

  return (
    <nav className="navigation" aria-label="Main Navigation">
      <ul className="navigation-list">
        <li className="navigation-item">
          <Link to="/" className="navigation-link" aria-label="Home">
            <Icons.home className="navigation-icon" aria-hidden="true" />
            Home
          </Link>
        </li>
        <li className="navigation-item">
          <Link to="/about" className="navigation-link" aria-label="About">
            <Icons.info className="navigation-icon" aria-hidden="true" />
            About
          </Link>
        </li>
        <li className="navigation-item">
          <Link to="/contact" className="navigation-link" aria-label="Contact">
            <Icons.mail className="navigation-icon" aria-hidden="true" />
            Contact
          </Link>
        </li>
      </ul>
      <Button onClick={toggleTheme} aria-label="Toggle theme">
        {isDarkMode ? <Icons.sun aria-hidden="true" /> : <Icons.moon aria-hidden="true" />}
      </Button>
    </nav>
  )
}

export default Navigation
