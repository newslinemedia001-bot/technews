import styles from './ArticleCard.module.css';
import skeletonStyles from './ArticleCardSkeleton.module.css';

export default function ArticleCardSkeleton({ variant = 'default', imageHeight = 200 }) {
    if (variant === 'featured') {
        return (
            <div className={`${styles.featuredCard} ${skeletonStyles.skeleton}`}>
                <div className={`${styles.featuredImage} ${skeletonStyles.shimmer}`}></div>
                <div className={styles.featuredBody}>
                    <div className={`${skeletonStyles.skeletonCategory} ${skeletonStyles.shimmer}`}></div>
                    <div className={`${skeletonStyles.skeletonFeaturedTitle} ${skeletonStyles.shimmer}`}></div>
                    <div className={`${skeletonStyles.skeletonFeaturedExcerpt} ${skeletonStyles.shimmer}`}></div>
                    <div className={skeletonStyles.skeletonMeta}>
                        <div className={`${skeletonStyles.skeletonMetaItem} ${skeletonStyles.shimmer}`}></div>
                        <div className={`${skeletonStyles.skeletonMetaItem} ${skeletonStyles.shimmer}`}></div>
                        <div className={`${skeletonStyles.skeletonMetaItem} ${skeletonStyles.shimmer}`}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'horizontal') {
        return (
            <div className={`${styles.horizontalCard} ${skeletonStyles.skeleton}`}>
                <div className={`${styles.horizontalImage} ${skeletonStyles.shimmer}`}></div>
                <div className={styles.horizontalBody}>
                    <div className={`${skeletonStyles.skeletonCategorySmall} ${skeletonStyles.shimmer}`}></div>
                    <div className={`${skeletonStyles.skeletonHorizontalTitle} ${skeletonStyles.shimmer}`}></div>
                    <div className={`${skeletonStyles.skeletonHorizontalTitle} ${skeletonStyles.shimmer}`} style={{ width: '60%' }}></div>
                    <div className={`${skeletonStyles.skeletonMetaSmall} ${skeletonStyles.shimmer}`}></div>
                </div>
            </div>
        );
    }

    if (variant === 'minimal') {
        return (
            <div className={`${styles.minimalCard} ${skeletonStyles.skeleton}`}>
                <div className={`${skeletonStyles.skeletonMinimalTitle} ${skeletonStyles.shimmer}`}></div>
                <div className={`${skeletonStyles.skeletonMinimalTitle} ${skeletonStyles.shimmer}`} style={{ width: '70%' }}></div>
                <div className={`${skeletonStyles.skeletonMetaSmall} ${skeletonStyles.shimmer}`}></div>
            </div>
        );
    }

    // Default card
    return (
        <div className={`${styles.card} ${skeletonStyles.skeleton}`}>
            <div className={`${styles.imageWrapper} ${skeletonStyles.shimmer}`} style={{ height: imageHeight }}></div>
            <div className={styles.body}>
                <div className={`${skeletonStyles.skeletonCategory} ${skeletonStyles.shimmer}`}></div>
                <div className={`${skeletonStyles.skeletonTitle} ${skeletonStyles.shimmer}`}></div>
                <div className={`${skeletonStyles.skeletonTitle} ${skeletonStyles.shimmer}`} style={{ width: '80%' }}></div>
                <div className={`${skeletonStyles.skeletonExcerpt} ${skeletonStyles.shimmer}`}></div>
                <div className={`${skeletonStyles.skeletonExcerpt} ${skeletonStyles.shimmer}`} style={{ width: '90%' }}></div>
                <div className={skeletonStyles.skeletonMeta}>
                    <div className={`${skeletonStyles.skeletonMetaItem} ${skeletonStyles.shimmer}`}></div>
                    <div className={`${skeletonStyles.skeletonMetaItem} ${skeletonStyles.shimmer}`}></div>
                </div>
            </div>
        </div>
    );
}
