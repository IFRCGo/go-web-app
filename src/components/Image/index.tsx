import { _cs, isDefined } from '@togglecorp/fujs';
import styles from './styles.module.css';

interface Props {
    className?: string;
    src?: string;
    alt?: string;
    fit?: React.CSSProperties['objectFit'];
    width?: number | string;
    height?: number | string;
    caption?: React.ReactNode;
    imageClassName?: string;
}

function Image(props: Props) {
    const {
        fit = 'cover',
        width = '100%',
        height = 'auto',
        className,
        src,
        alt,
        caption,
        imageClassName,
    } = props;

    return (
        <figure className={_cs(styles.imageContainer, className)}>
            <img
                src={src}
                alt={alt}
                className={_cs(styles.image, imageClassName)}
                style={{
                    objectFit: fit,
                    width,
                    height,
                }}
            />
            {isDefined(caption) && (
                <figcaption className={styles.caption}>
                    {caption}
                </figcaption>
            )}
        </figure>
    );
}

export default Image;
