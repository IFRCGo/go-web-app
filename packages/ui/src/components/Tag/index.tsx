import ChipLayout, { type ChipColorVariant } from '#components/ChipLayout';

export interface Props {
    className?: string;
    /** The visible label */
    label: React.ReactNode;
    /** Optional leading icon */
    icon?: React.ReactNode;
    /** Color axis, forwarded to the underlying ChipLayout */
    colorVariant?: ChipColorVariant;
    /** Render as a list item when used inside a `<ul>`/`<ol>` */
    as?: 'span' | 'div' | 'li';
}

/**
 * Static label pill (specific layer, display).
 *
 * Composes `ChipLayout` with the 'tag' style to render a non-interactive,
 * inline label — no remove action, no behaviour. Pass `as="li"` to use it
 * safely as a list item.
 */
function Tag(props: Props) {
    const {
        className,
        label,
        icon,
        colorVariant = 'tertiary',
        as = 'span',
    } = props;

    return (
        <ChipLayout
            className={className}
            styleVariant="tag"
            colorVariant={colorVariant}
            leading={icon}
            label={label}
            as={as}
        />
    );
}

export default Tag;
