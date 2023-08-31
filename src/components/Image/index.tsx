import { _cs, isDefined } from '@togglecorp/fujs';
import styles from './styles.module.css';

interface Props {
    className?: string;
    src: string | null | undefined;
    alt?: string;
    caption?: React.ReactNode;
    imageClassName?: string;
}

function Image(props: Props) {
    const {
        className,
        src,
        alt = '',
        caption,
        imageClassName,
    } = props;

    if (!src) {
        return null;
    }

    return (
        <figure className={_cs(styles.imageContainer, className)}>
            <img
                src={src}
                alt={alt}
                className={_cs(styles.image, imageClassName)}
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
