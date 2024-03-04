import {
    useCallback,
    useState,
} from 'react';
import {
    _cs,
    isDefined,
    isFalsyString,
    isTruthyString,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props {
    src: string | null | undefined;
    alt?: string;
    caption?: React.ReactNode;
    imgElementClassName?: string;
}

function Image(props: Props) {
    const {
        src,
        alt,
        caption,
        imgElementClassName,
    } = props;

    const [errored, setErrored] = useState(false);

    const handleImageError = useCallback(
        () => {
            setErrored(true);
        },
        [],
    );

    const handleImageLoad = useCallback(
        () => {
            setErrored(false);
        },
        [],
    );

    if (isFalsyString(src)) {
        return null;
    }

    const hasCaption = typeof caption === 'string' ? isTruthyString(caption) : isDefined(caption);

    return (
        <figure className={_cs(styles.image, errored && styles.errored)}>
            {errored && (
                <div className={_cs(styles.imgError, imgElementClassName)}>
                    Image not available!
                </div>
            )}
            <img
                onError={handleImageError}
                onLoad={handleImageLoad}
                className={_cs(styles.imgElement, imgElementClassName)}
                src={src}
                alt={alt}
            />
            {hasCaption && (
                <figcaption className={styles.caption}>
                    {caption}
                </figcaption>
            )}
        </figure>
    );
}

export default Image;
