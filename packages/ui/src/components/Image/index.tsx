import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import Modal from '#components/Modal';
import useBooleanState from '#hooks/useBooleanState';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    src?: string;
    alt?: string;
    caption?: React.ReactNode;
    captionClassName?: string;
    imgElementClassName?: string;
    withCaptionHidden?: boolean;
    expandable?: boolean;
}

function Image(props: Props) {
    const {
        className,
        src,
        alt = '',
        caption,
        imgElementClassName,
        captionClassName,
        withCaptionHidden = false,
        expandable,
    } = props;

    const [
        isExpanded,
        {
            setTrue: setIsExpandedTrue,
            setFalse: setIsExpandedFalse,
        },
    ] = useBooleanState(false);

    if (!src) {
        return null;
    }

    return (
        <figure
            className={_cs(styles.image, expandable && styles.expandable, className)}
            title={withCaptionHidden && typeof caption === 'string' ? caption : undefined}
        >
            <img
                role="presentation"
                onClick={expandable ? setIsExpandedTrue : undefined}
                src={src}
                alt={alt}
                className={_cs(styles.imgElement, imgElementClassName)}
            />
            {!withCaptionHidden && isDefined(caption) && (
                <figcaption className={_cs(captionClassName, styles.caption)}>
                    {caption}
                </figcaption>
            )}
            {isExpanded && (
                <Modal
                    className={styles.expandedModal}
                    childrenContainerClassName={styles.content}
                    size="full"
                    heading={caption}
                    headingLevel={5}
                    onClose={setIsExpandedFalse}
                >
                    <img
                        className={_cs(styles.imgElement)}
                        src={src}
                        alt={alt}
                    />
                </Modal>
            )}
        </figure>
    );
}

export default Image;
