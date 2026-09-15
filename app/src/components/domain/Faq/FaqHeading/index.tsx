import { type ReactNode } from 'react';
import { Heading } from '@ifrc-go/ui';

import styles from './styles.module.css';

interface Props {
    children: ReactNode;
    // 'section' is a top-level block inside an answer; 'subsection' sits under one.
    variant: 'section' | 'subsection';
}

// Titles inside an FAQ answer. The upper-casing is applied in CSS rather than baked
// into the translated string, so translations stay free to follow their own casing
// conventions (and scripts without letter case are unaffected).
function FaqHeading(props: Props) {
    const {
        children,
        variant,
    } = props;

    return (
        <Heading
            level={6}
            className={variant === 'section' ? styles.sectionHeading : styles.subsectionHeading}
        >
            {children}
        </Heading>
    );
}

export default FaqHeading;
