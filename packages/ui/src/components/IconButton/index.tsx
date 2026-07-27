import { _cs } from '@togglecorp/fujs';

import Button, { Props as ButtonProps } from '#components/Button';

import styles from './styles.module.css';

export interface Props<N> extends ButtonProps<N> {
    /** Accessible name for the icon-only content (rendered as aria-label) */
    ariaLabel: string;
    /** Tooltip text; required since the visible content is only an icon */
    title: string;
}

/**
 * Button for icon-only content (specific layer).
 *
 * Wraps Button (and therefore shares its curated `variant` API) and
 * enforces an accessible name (`ariaLabel`) and a `title`, since the
 * visible content carries no text. The icon is sized through the
 * standard icon height multiplier.
 *
 * Unlike Button, the default variant is 'tertiary': a bare icon
 * button renders as a plain icon, not an outlined pill.
 */
function IconButton<const N>(props: Props<N>) {
    const {
        ariaLabel,
        children,
        className,
        variant = 'tertiary',
        ...otherProps
    } = props;

    return (
        <Button
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            variant={variant}
            className={_cs(styles.iconButton, className)}
            aria-label={ariaLabel}
        >
            {children}
        </Button>
    );
}

export default IconButton;
