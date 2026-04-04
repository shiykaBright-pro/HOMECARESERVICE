import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useState, useEffect, useRef } from 'react';
import './Navbar.css';

function Navbar() {
  const { currentUser, logout, notifications } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();
  
  const unreadCount = notifications.filter(n => !n.read && n.userId === currentUser?.id).length;

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  // Mobile menu toggle
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu on route change or outside click
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 769);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen && isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isMobile]);

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar-logo">
        <Link to="/">
          <div className="logo-icon">
            <span className="logo-heart">❤</span>
            <span className="logo-cross">+</span>
          </div>
          <div className="logo-text">
            <span className="logo-name">HomeCare</span>
            <span className="logo-tagline">Health at Home</span>
          </div>
        </Link>
      </div>

      <button className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`navbar-nav ${isMenuOpen ? 'active' : ''}`}>
        <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
        <Link to="/services" onClick={() => setIsMenuOpen(false)}>Services</Link>
        <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
        <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
        
        {currentUser ? (
          <>
            <Link to="/messages" className="nav-link-with-badge" onClick={() => setIsMenuOpen(false)}>
              Messages
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </Link>
            <Link to="/reviews" onClick={() => setIsMenuOpen(false)}>Reviews</Link>
            <div className="user-menu">
              <Link to="" className="user-name">{currentUser.name}</Link>
              <div className="dropdown-content">
                <Link to={`/dashboard/${currentUser.role}`} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <Link to="/" onClick={handleLogout}>Logout</Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-login" onClick={() => setIsMenuOpen(false)}>Login</Link>
            <Link to="/register" className="btn-register" onClick={() => setIsMenuOpen(false)}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

