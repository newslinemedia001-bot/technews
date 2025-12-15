'use client';

import { useState, useEffect, useMemo } from 'react';
import { analyzeContent, getImprovementSuggestions, getOptimalKeywordCount } from '@/lib/invitus-seo';
import styles from './InvitusSEO.module.css';

export default function InvitusSEO({
    focusKeyword,
    seoTitle,
    metaDescription,
    slug,
    content,
    featuredImage,
    onFocusKeywordChange,
    onSeoTitleChange,
    onMetaDescriptionChange,
    onSlugChange
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    // Analyze content whenever inputs change
    const analysis = useMemo(() => {
        return analyzeContent({
            focusKeyword,
            seoTitle,
            metaDescription,
            slug,
            content,
            featuredImage
        });
    }, [focusKeyword, seoTitle, metaDescription, slug, content, featuredImage]);

    const suggestions = useMemo(() => {
        return getImprovementSuggestions(analysis.results);
    }, [analysis.results]);

    const optimalKeywordCount = useMemo(() => {
        return getOptimalKeywordCount(analysis.stats.wordCount);
    }, [analysis.stats.wordCount]);

    return (
        <div className={styles.panel}>
            {/* Header */}
            <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
                <div className={styles.headerContent}>
                    <div className={styles.logo}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="m16 12-4-4-4 4" />
                            <path d="M12 16V8" />
                        </svg>
                        <span>Invitus SEO</span>
                    </div>
                    <div className={styles.scoreWrapper}>
                        <div
                            className={styles.scoreBadge}
                            style={{
                                backgroundColor: analysis.status.bgColor,
                                color: analysis.status.color,
                                borderColor: analysis.status.color
                            }}
                        >
                            <span className={styles.scoreValue}>{analysis.score}</span>
                            <span className={styles.scoreLabel}>/100</span>
                        </div>
                        <span className={styles.statusLabel} style={{ color: analysis.status.color }}>
                            {analysis.status.label}
                        </span>
                    </div>
                </div>
                <button className={styles.toggleBtn}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className={styles.content}>
                    {/* Focus Keyword Input */}
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                            Focus Keyword
                            <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            className={styles.input}
                            value={focusKeyword}
                            onChange={(e) => onFocusKeywordChange(e.target.value)}
                            placeholder="Enter your focus keyword"
                        />
                        {focusKeyword && (
                            <div className={styles.keywordStats}>
                                <span>Density: {analysis.stats.keywordDensity}%</span>
                                <span>Optimal: {optimalKeywordCount.min}-{optimalKeywordCount.max} times</span>
                            </div>
                        )}
                    </div>

                    {/* SEO Title Input */}
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                            SEO Title
                            <span className={styles.charCount} style={{
                                color: analysis.stats.titleLength >= 50 && analysis.stats.titleLength <= 60
                                    ? 'var(--color-success)'
                                    : 'var(--color-warning)'
                            }}>
                                {analysis.stats.titleLength}/60
                            </span>
                        </label>
                        <input
                            type="text"
                            className={styles.input}
                            value={seoTitle}
                            onChange={(e) => onSeoTitleChange(e.target.value)}
                            placeholder="Enter SEO title (50-60 characters)"
                        />
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{
                                    width: `${Math.min((analysis.stats.titleLength / 60) * 100, 100)}%`,
                                    backgroundColor: analysis.stats.titleLength > 60 ? 'var(--color-error)' :
                                        analysis.stats.titleLength >= 50 ? 'var(--color-success)' : 'var(--color-warning)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Meta Description Input */}
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                            Meta Description
                            <span className={styles.charCount} style={{
                                color: analysis.stats.metaLength >= 150 && analysis.stats.metaLength <= 160
                                    ? 'var(--color-success)'
                                    : 'var(--color-warning)'
                            }}>
                                {analysis.stats.metaLength}/160
                            </span>
                        </label>
                        <textarea
                            className={styles.textarea}
                            value={metaDescription}
                            onChange={(e) => onMetaDescriptionChange(e.target.value)}
                            placeholder="Enter meta description (150-160 characters)"
                            rows={3}
                        />
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{
                                    width: `${Math.min((analysis.stats.metaLength / 160) * 100, 100)}%`,
                                    backgroundColor: analysis.stats.metaLength > 160 ? 'var(--color-error)' :
                                        analysis.stats.metaLength >= 150 ? 'var(--color-success)' : 'var(--color-warning)'
                                }}
                            />
                        </div>
                    </div>

                    {/* URL Slug Input */}
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>URL Slug</label>
                        <div className={styles.slugInput}>
                            <span className={styles.slugPrefix}>technews.co.ke/article/</span>
                            <input
                                type="text"
                                className={styles.input}
                                value={slug}
                                onChange={(e) => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                placeholder="article-slug"
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className={styles.stats}>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{analysis.stats.wordCount}</span>
                            <span className={styles.statLabel}>Words</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{analysis.passedChecks}</span>
                            <span className={styles.statLabel}>Passed</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{analysis.failedChecks}</span>
                            <span className={styles.statLabel}>Failed</span>
                        </div>
                    </div>

                    {/* Checklist */}
                    <div className={styles.checklist}>
                        <h4 className={styles.checklistTitle}>SEO Checklist</h4>
                        <ul className={styles.checklistItems}>
                            {analysis.results.map((result) => (
                                <li
                                    key={result.id}
                                    className={`${styles.checkItem} ${result.passed ? styles.passed : styles.failed}`}
                                >
                                    <span className={styles.checkIcon}>
                                        {result.passed ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 6 6 18" />
                                                <path d="m6 6 12 12" />
                                            </svg>
                                        )}
                                    </span>
                                    <div className={styles.checkContent}>
                                        <span className={styles.checkName}>{result.name}</span>
                                        {!result.passed && (
                                            <span className={styles.checkDesc}>{result.description}</span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className={styles.suggestions}>
                            <h4 className={styles.suggestionsTitle}>Improvement Suggestions</h4>
                            <ul className={styles.suggestionsList}>
                                {suggestions.slice(0, 5).map((suggestion) => (
                                    <li key={suggestion.id} className={styles.suggestionItem}>
                                        <span className={styles.suggestionIcon}>💡</span>
                                        <span>{suggestion.suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
