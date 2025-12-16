'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './RichTextEditor.module.css';

// Toolbar button component
const ToolbarButton = ({ icon, title, onClick, active = false }) => (
    <button
        type="button"
        className={`${styles.toolbarBtn} ${active ? styles.active : ''}`}
        onClick={onClick}
        title={title}
    >
        {icon}
    </button>
);

export default function RichTextEditor({ value, onChange, placeholder = 'Write your article here...' }) {
    const editorRef = useRef(null);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [savedSelection, setSavedSelection] = useState(null);

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value || '';
        }
    }, []);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    const execCommand = useCallback((command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    }, [handleInput]);

    const formatBlock = useCallback((tag) => {
        document.execCommand('formatBlock', false, tag);
        editorRef.current?.focus();
        handleInput();
    }, [handleInput]);

    const insertHeading = useCallback((level) => {
        formatBlock(`h${level}`);
    }, [formatBlock]);

    const insertLink = useCallback(() => {
        if (linkUrl) {
            // Restore selection
            if (savedSelection) {
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(savedSelection);
            }

            const text = linkText || linkUrl;
            const html = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
            document.execCommand('insertHTML', false, html);
            setShowLinkModal(false);
            setLinkUrl('');
            setLinkText('');
            setSavedSelection(null);
            editorRef.current?.focus();
            handleInput();
        }
    }, [linkUrl, linkText, savedSelection, handleInput]);

    const openLinkModal = useCallback(() => {
        // Save current selection
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            setSavedSelection(range.cloneRange());
            
            // Get selected text if any
            const selectedText = sel.toString();
            if (selectedText) {
                setLinkText(selectedText);
            }
        }
        setShowLinkModal(true);
    }, []);

    const insertImage = useCallback((url, alt = '') => {
        const html = `<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto;" />`;
        document.execCommand('insertHTML', false, html);
        handleInput();
    }, [handleInput]);

    const handleImageUpload = useCallback(() => {
        const url = prompt('Enter image URL:');
        if (url) {
            const alt = prompt('Enter image alt text (optional):') || '';
            insertImage(url, alt);
        }
    }, [insertImage]);

    const insertYouTubeVideo = useCallback(() => {
        const url = prompt('Enter YouTube URL:');
        if (url) {
            // Extract video ID from various YouTube URL formats
            const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
            if (videoIdMatch && videoIdMatch[1]) {
                const videoId = videoIdMatch[1];
                // Create a wrapper with delete button and paragraphs before/after
                const html = `
                    <p><br></p>
                    <div class="video-embed-wrapper" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1.5rem 0; border-radius: 8px; background: #f0f0f0;">
                        <button onclick="this.parentElement.remove()" style="position: absolute; top: 10px; right: 10px; z-index: 10; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer; font-size: 12px; font-weight: 600;">Delete Video</button>
                        <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px;"></iframe>
                    </div>
                    <p><br></p>
                `;
                document.execCommand('insertHTML', false, html);
                handleInput();
            } else {
                alert('Invalid YouTube URL');
            }
        }
    }, [handleInput]);

    const insertBlockquote = useCallback(() => {
        formatBlock('blockquote');
    }, [formatBlock]);

    const insertList = useCallback((ordered = false) => {
        execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
    }, [execCommand]);

    return (
        <div className={styles.editor}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.toolbarGroup}>
                    <select
                        className={styles.headingSelect}
                        onChange={(e) => {
                            if (e.target.value === 'p') {
                                formatBlock('p');
                            } else {
                                insertHeading(e.target.value);
                            }
                            e.target.value = '';
                        }}
                        defaultValue=""
                    >
                        <option value="" disabled>Heading</option>
                        <option value="p">Paragraph</option>
                        <option value="2">Heading 2</option>
                        <option value="3">Heading 3</option>
                        <option value="4">Heading 4</option>
                    </select>
                </div>

                <div className={styles.separator} />

                <div className={styles.toolbarGroup}>
                    <ToolbarButton
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 12a4 4 0 0 0 0-8H6v16h10a4 4 0 0 0 0-8" /><path d="M6 12h8" /></svg>}
                        title="Bold"
                        onClick={() => execCommand('bold')}
                    />
                    <ToolbarButton
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" x2="10" y1="4" y2="4" /><line x1="14" x2="5" y1="20" y2="20" /><line x1="15" x2="9" y1="4" y2="20" /></svg>}
                        title="Italic"
                        onClick={() => execCommand('italic')}
                    />
                    <ToolbarButton
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4v16" /><path d="M18 4v16" /><path d="M6 12h12" /></svg>}
                        title="Underline"
                        onClick={() => execCommand('underline')}
                    />
                    <ToolbarButton
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" /></svg>}
                        title="Strikethrough"
                        onClick={() => execCommand('strikeThrough')}
                    />
                </div>

                <div className={styles.separator} />

                <div className={styles.toolbarGroup}>
                    <ToolbarButton
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></svg>}
                        title="Bullet List"
                        onClick={() => insertList(false)}
                    />
                    <ToolbarButton
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" x2="21" y1="6" y2="6" /><line x1="10" x2="21" y1="12" y2="12" /><line x1="10" x2="21" y1="18" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>}
                        title="Numbered List"
                        onClick={() => insertList(true)}
                    />
                </div>

                <div className={styles.separator} />

                <div className={styles.toolbarGroup}>
                    <ToolbarButton
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>}
                        title="Insert Link"
                        onClick={openLinkModal}
                    />
                    <ToolbarButton
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>}
                        title="Insert Image"
                        onClick={handleImageUpload}
                    />
                    <ToolbarButton
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>}
                        title="Insert YouTube Video"
                        onClick={insertYouTubeVideo}
                    />
                    <ToolbarButton
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" /></svg>}
                        title="Blockquote"
                        onClick={insertBlockquote}
                    />
                </div>

                <div className={styles.separator} />

                <div className={styles.toolbarGroup}>
                    <ToolbarButton
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6" /><line x1="15" x2="3" y1="12" y2="12" /><line x1="17" x2="3" y1="18" y2="18" /></svg>}
                        title="Align Left"
                        onClick={() => execCommand('justifyLeft')}
                    />
                    <ToolbarButton
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6" /><line x1="18" x2="6" y1="12" y2="12" /><line x1="21" x2="3" y1="18" y2="18" /></svg>}
                        title="Align Center"
                        onClick={() => execCommand('justifyCenter')}
                    />
                    <ToolbarButton
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6" /><line x1="21" x2="9" y1="12" y2="12" /><line x1="21" x2="7" y1="18" y2="18" /></svg>}
                        title="Align Right"
                        onClick={() => execCommand('justifyRight')}
                    />
                </div>

                <div className={styles.separator} />

                <div className={styles.toolbarGroup}>
                    <ToolbarButton
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>}
                        title="Undo"
                        onClick={() => execCommand('undo')}
                    />
                    <ToolbarButton
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" /></svg>}
                        title="Redo"
                        onClick={() => execCommand('redo')}
                    />
                </div>
            </div>

            {/* Editor Content */}
            <div
                ref={editorRef}
                className={styles.content}
                contentEditable
                onInput={handleInput}
                data-placeholder={placeholder}
                suppressContentEditableWarning
            />

            {/* Link Modal */}
            {showLinkModal && (
                <div className={styles.modalOverlay} onClick={() => setShowLinkModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>Insert Link</h3>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>URL</label>
                            <input
                                type="url"
                                className={styles.input}
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://example.com"
                                autoFocus
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Link Text (optional)</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={linkText}
                                onChange={(e) => setLinkText(e.target.value)}
                                placeholder="Click here"
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={() => setShowLinkModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={styles.insertBtn}
                                onClick={insertLink}
                                disabled={!linkUrl}
                            >
                                Insert Link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
