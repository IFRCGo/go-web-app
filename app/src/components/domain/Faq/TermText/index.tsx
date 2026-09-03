import { type ReactNode } from 'react';
import { isDefined } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    // Carries its own colon, so that translations keep control of the punctuation:
    // French and Spanish put a space before it.
    term: string;
    // The rest of the sentence. Omitted where the term stands alone, as a lead-in
    // line or an inline phrase.
    children?: ReactNode;
    variant: 'bold' | 'underline';
}

function TermText(props: Props) {
    const {
        className,
        term,
        children,
        variant,
    } = props;

    return (
        <span className={className}>
            <span className={variant === 'bold' ? styles.boldTerm : styles.underlinedTerm}>
                {term}
            </span>
            {isDefined(children) && (
                <>
                    {' '}
                    {children}
                </>
            )}
        </span>
    );
}

export default TermText;
