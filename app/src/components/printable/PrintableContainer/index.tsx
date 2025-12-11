import {
    Heading,
    type HeadingProps,
} from '@ifrc-go/ui/printable';
import { getSpacingValue } from '@ifrc-go/ui/utils';

import styles from './styles.module.css';

interface Props {
    heading?: React.ReactNode;
    headingLevel?: HeadingProps['level'];
    breakBefore?: boolean;
    breakAfter?: boolean;
    children?: React.ReactNode;
}

function PrintableContainer(props: Props) {
    const {
        heading,
        headingLevel = 3,
        breakAfter,
        breakBefore,
        children,
    } = props;

    const spacing = getSpacingValue('3xl', -headingLevel);

    return (
        <>
            {breakBefore && <div className={styles.pageBreak} />}
            {heading && (
                <Heading
                    level={headingLevel}
                    className={styles.heading}
                >
                    {heading}
                </Heading>
            )}
            {children}
            <div
                className={styles.blockSpacing}
                style={{ marginBlockEnd: spacing }}
            />
            {breakAfter && <div className={styles.pageBreak} />}
        </>
    );
}

export default PrintableContainer;
