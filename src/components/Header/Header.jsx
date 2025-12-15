'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { categories } from '@/lib/categories';
import styles from './Header.module.css';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        // Initialize theme - default to dark
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Close menu on outside click
        const handleClickOutside = (e) => {
            if (isMenuOpen && !e.target.closest(`.${styles.mobileMenu}`) && !e.target.closest(`.${styles.menuToggle}`)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    return (
        <header className={styles.header}>
            {/* Mobile Menu Overlay */}
            {isMenuOpen && <div className={styles.overlay} onClick={() => setIsMenuOpen(false)} />}

            {/* Mobile Sidebar Menu */}
            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
                <div className={styles.mobileMenuHeader}>
                    <button
                        className={styles.closeMenu}
                        onClick={() => setIsMenuOpen(false)}
                        aria-label="Close menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                    <button
                        className={styles.searchToggle}
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        aria-label="Search"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                    </button>
                </div>
                <ul className={styles.mobileMenuList}>
                    <li className={styles.mobileMenuItem}>
                        <Link href="/" className={styles.mobileMenuLink} onClick={() => setIsMenuOpen(false)}>Home</Link>
                    </li>
                    {categories.map((category) => (
                        <li key={category.id} className={styles.mobileMenuItem}>
                            <Link href={`/category/${category.slug}`} className={styles.mobileMenuLink} onClick={() => setIsMenuOpen(false)}>
                                {category.name}
                            </Link>
                        </li>
                    ))}
                    <li className={styles.mobileMenuItem}>
                        <Link href="/advertise" className={styles.mobileMenuLink} onClick={() => setIsMenuOpen(false)}>Advertise</Link>
                    </li>
                </ul>
            </div>

            {/* Main Header */}
            <div className={styles.mainHeader}>
                <div className="container">
                    <div className={styles.mainHeaderContent}>
                        {/* Left Section - Menu Toggle & Search */}
                        <div className={styles.leftSection}>
                            <button
                                className={styles.menuToggle}
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="4" y1="6" x2="20" y2="6" />
                                    <line x1="4" y1="12" x2="20" y2="12" />
                                    <line x1="4" y1="18" x2="20" y2="18" />
                                </svg>
                            </button>

                            {/* Search Icon Only */}
                            <button 
                                className={styles.searchToggle}
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                aria-label="Search"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                            </button>
                        </div>

                        {/* Search Bar */}
                        {isSearchOpen && (
                            <div className={styles.searchBar}>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    if (searchQuery.trim()) {
                                        window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
                                        setSearchQuery('');
                                        setIsSearchOpen(false);
                                    }
                                }}>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={styles.searchInput}
                                        autoFocus
                                    />
                                    <button type="submit" className={styles.searchSubmit}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="11" cy="11" r="8" />
                                            <path d="m21 21-4.3-4.3" />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Logo - Centered */}
                        <Link href="/" className={styles.logo}>
                            <div className={styles.logoText}>
                                <span className={styles.logoPrimary}>Tech</span>
                                <span className={styles.logoAccent}>News</span>
                            </div>
                        </Link>

                        {/* Right Section */}
                        <div className={styles.rightSection}>
                            {/* Theme Toggle */}
                            <button
                                className={styles.themeToggle}
                                onClick={toggleTheme}
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="5"></circle>
                                        <line x1="12" y1="1" x2="12" y2="3"></line>
                                        <line x1="12" y1="21" x2="12" y2="23"></line>
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                        <line x1="1" y1="12" x2="3" y2="12"></line>
                                        <line x1="21" y1="12" x2="23" y2="12"></line>
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                    </svg>
                                )}
                            </button>

                            {/* Sign In Button */}
                            <button 
                                className={styles.signInBtn}
                                onClick={() => window.location.href = '/admin'}
                            >
                                Sign in
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Bar - Always Visible */}
            <nav className={styles.nav}>
                <div className="container">
                    <ul className={styles.navList}>
                        <li className={styles.navItem}>
                            <Link href="/" className={styles.navLink}>Home</Link>
                        </li>
                        {categories.map((category) => (
                            <li key={category.id} className={styles.navItem}>
                                <Link href={`/category/${category.slug}`} className={styles.navLink}>
                                    {category.name}
                                </Link>
                                {category.subcategories && category.subcategories.length > 0 && (
                                    <div className={styles.dropdown}>
                                        {category.subcategories.map((sub) => (
                                            <Link
                                                key={sub.id}
                                                href={`/category/${category.slug}/${sub.slug}`}
                                                className={styles.dropdownLink}
                                            >
                                                {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                        <li className={styles.navItem}>
                            <Link href="/advertise" className={styles.navLink}>Advertise</Link>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    );
}
