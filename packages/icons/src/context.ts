import { createContext } from 'react';
import type { CSSProperties } from 'react';

export interface IconsContextValue {
    /** Default size applied to all icons (sets both width and height). Individual icon props take precedence. */
    size?: number | string;
    /** Default className appended to all icons. Icon-level className is appended after this. */
    className?: string;
    /** Default inline styles merged into all icons. Icon-level style takes precedence for overlapping properties. */
    style?: CSSProperties;
}

const IconsContext = createContext<IconsContextValue>({});

export default IconsContext;
