import {
    useMemo,
    type CSSProperties,
    type ReactNode,
} from 'react';

import IconsContext, { type IconsContextValue } from './context';

interface Props {
    children: ReactNode;
    /** Default size for all icons within this provider (sets width and height). */
    size?: number | string;
    /** Default className appended to every icon within this provider. */
    className?: string;
    /** Default inline styles merged into every icon within this provider. */
    style?: CSSProperties;
}

/**
 * IconsProvider lets you configure default visual properties for all icons
 * within its subtree. Icon-level props always take precedence over provider defaults.
 *
 * @example
 * <IconsProvider size={24} style={{ color: 'red' }}>
 *   <MenuLineIcon />   // rendered at 24×24 in red
 *   <CloseLineIcon size={16} /> // 16×16, still red
 * </IconsProvider>
 */
function IconsProvider({
    children,
    size,
    className,
    style,
}: Props) {
    const value = useMemo<IconsContextValue>(() => ({
        size,
        className,
        style,
    }), [size, className, style]);

    return (
        <IconsContext.Provider value={value}>
            {children}
        </IconsContext.Provider>
    );
}

export default IconsProvider;
