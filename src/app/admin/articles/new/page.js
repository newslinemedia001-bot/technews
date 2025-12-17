'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentAdmin } from '@/lib/auth';
import { createArticle } from '@/lib/articles';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { getMainCategoriesOnly } from '@/lib/categories';
import { extractYouTubeId, getYouTubeThumbnail, isYouTubeUrl } from '@/lib/youtube';
import RichTextEditor from '@/components/RichTextEditor';
import InvitusSEO from '@/components/InvitusSEO';
import slugify from 'slugify';
import styles from './page.module.css';

export default function NewArticle() {
    const router = useRouter();
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Article data
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [author, setAuthor] = useState('');
    const [featuredImage, setFeaturedImage] = useState('');
    const [featuredImageCaption, setFeaturedImageCaption] = useState('');
    const [featured, setFeatured] = useState(false);
    const [status, setStatus] = useState('draft');
    const [youtubeUrl, setYoutubeUrl] = useState('');

    // SEO data
    const [focusKeyword, setFocusKeyword] = useState('');
    const [seoTitle, setSeoTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [slug, setSlug] = useState('');

    const categories = getMainCategoriesOnly();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const adminData = await getCurrentAdmin();
                if (!adminData) {
                    router.push('/admin/login');
                    return;
                }
                setAdmin(adminData);
                setAuthor(adminData.name || 'TechNews');
            } catch (error) {
                console.error('Auth error:', error);
                router.push('/admin/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    // Auto-generate slug from title
    useEffect(() => {
        if (title && !slug) {
            const generatedSlug = slugify(title, {
                lower: true,
                strict: true,
                trim: true
            });
            setSlug(generatedSlug);
        }

        // Auto-fill SEO title
        if (title && !seoTitle) {
            setSeoTitle(title.slice(0, 60));
        }
    }, [title, slug, seoTitle]);

    const handleImageUpload = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const result = await uploadToCloudinary(file);
            setFeaturedImage(result.url);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    }, []);

    // Handle YouTube URL change
    const handleYouTubeUrlChange = useCallback((url) => {
        setYoutubeUrl(url);

        if (isYouTubeUrl(url)) {
            const videoId = extractYouTubeId(url);
            if (videoId) {
                // Auto-set thumbnail as featured image
                const thumbnail = getYouTubeThumbnail(videoId);
                setFeaturedImage(thumbnail);
            }
        }
    }, []);

    const handleSave = async (publishStatus = 'draft') => {
        if (!title) {
            alert('Please enter a title');
            return;
        }

        if (!category) {
            alert('Please select a category');
            return;
        }

        if (!content) {
            alert('Please add some content');
            return;
        }

        setSaving(true);
        try {
            const articleData = {
                title,
                summary,
                content,
                category: category, // Just the main category now
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                author,
                featuredImage,
                featuredImageCaption,
                featured,
                status: publishStatus,
                focusKeyword,
                seoTitle: seoTitle || title,
                metaDescription,
                slug,
                youtubeUrl: youtubeUrl || null,
                videoId: youtubeUrl ? extractYouTubeId(youtubeUrl) : null
            };

            const { id, slug: newSlug } = await createArticle(articleData);

            alert(publishStatus === 'published'
                ? 'Article published successfully!'
                : 'Draft saved successfully!'
            );

            router.push('/admin');
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save article. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading editor...</p>
            </div>
        );
    }

    return (
        <div className={styles.editorPage}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/admin" className={styles.backBtn}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className={styles.pageTitle}>New Article</h1>
                        <p className={styles.pageSubtitle}>Create a new article with SEO optimization</p>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <button
                        className={styles.draftBtn}
                        onClick={() => handleSave('draft')}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                        className={styles.publishBtn}
                        onClick={() => handleSave('published')}
                        disabled={saving}
                    >
                        {saving ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className={styles.content}>
                <div className={styles.contentGrid}>
                    {/* Main Editor */}
                    <div className={styles.mainColumn}>
                        {/* Title */}
                        <div className={styles.titleWrapper}>
                            <input
                                type="text"
                                className={styles.titleInput}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter article title..."
                            />
                        </div>

                        {/* Summary */}
                        <div className={styles.editorWrapper}>
                            <label className={styles.label}>Summary</label>
                            <textarea
                                className={styles.textarea}
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder="Brief summary of the article (appears below title)..."
                            />
                        </div>

                        {/* Content Editor */}
                        <div className={styles.editorWrapper}>
                            <label className={styles.label}>Content</label>
                            <RichTextEditor
                                value={content}
                                onChange={setContent}
                                placeholder="Write your article content here..."
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className={styles.sidebar}>
                        {/* Invitus SEO */}
                        <InvitusSEO
                            focusKeyword={focusKeyword}
                            seoTitle={seoTitle}
                            metaDescription={metaDescription}
                            slug={slug}
                            content={content}
                            featuredImage={featuredImage}
                            onFocusKeywordChange={setFocusKeyword}
                            onSeoTitleChange={setSeoTitle}
                            onMetaDescriptionChange={setMetaDescription}
                            onSlugChange={setSlug}
                        />

                        {/* Featured Image */}
                        <div className={styles.panel}>
                            <h3 className={styles.panelTitle}>Featured Image</h3>
                            <div className={styles.imageUpload}>
                                {featuredImage ? (
                                    <div className={styles.imagePreview}>
                                        <Image
                                            src={featuredImage}
                                            alt="Featured image"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                        <button
                                            className={styles.removeImage}
                                            onClick={() => setFeaturedImage('')}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 6 6 18" />
                                                <path d="m6 6 12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <label className={styles.uploadArea}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                        <div className={styles.uploadContent}>
                                            {uploading ? (
                                                <>
                                                    <div className={styles.uploadSpinner}></div>
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                                        <circle cx="9" cy="9" r="2" />
                                                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                                    </svg>
                                                    <span>Click to upload image</span>
                                                    <small>or drag and drop</small>
                                                </>
                                            )}
                                        </div>
                                    </label>
                                )}
                            </div>
                            {featuredImage && (
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Image Caption</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={featuredImageCaption}
                                        onChange={(e) => setFeaturedImageCaption(e.target.value)}
                                        placeholder="Image caption (optional)"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Category & Tags */}
                        <div className={styles.panel}>
                            <h3 className={styles.panelTitle}>Category & Tags</h3>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Category *</label>
                                <select
                                    className={styles.select}
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Tags</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="tag1, tag2, tag3"
                                />
                                <small className={styles.helper}>Separate tags with commas</small>
                            </div>
                        </div>

                        {/* YouTube Video - Only show for videos category */}
                        {category === 'videos' && (
                            <div className={styles.panel}>
                                <h3 className={styles.panelTitle}>YouTube Video</h3>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>YouTube URL *</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={youtubeUrl}
                                        onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                    <small className={styles.helper}>Paste YouTube link - thumbnail will auto-set as featured image</small>
                                </div>
                                {youtubeUrl && extractYouTubeId(youtubeUrl) && (
                                    <div className={styles.videoPreview}>
                                        <iframe
                                            width="100%"
                                            height="200"
                                            src={`https://www.youtube.com/embed/${extractYouTubeId(youtubeUrl)}`}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            style={{ borderRadius: 'var(--radius-md)' }}
                                        ></iframe>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Author & Options */}
                        <div className={styles.panel}>
                            <h3 className={styles.panelTitle}>Author & Options</h3>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Author</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    placeholder="Article author"
                                />
                            </div>
                            <div className={styles.checkboxGroup}>
                                <label className={styles.checkbox}>
                                    <input
                                        type="checkbox"
                                        checked={featured}
                                        onChange={(e) => setFeatured(e.target.checked)}
                                    />
                                    <span className={styles.checkmark}></span>
                                    <span>Featured article</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
