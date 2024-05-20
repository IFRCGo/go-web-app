import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import InfoPopup from '#components/InfoPopup';

import styles from './styles.module.css';

type NumColumn = 1 | 2 | 3 | 4;
export interface Props {
    className?: string;
    title?: React.ReactNode;
    children?: React.ReactNode;
    description?: React.ReactNode;
    contentSectionClassName?: string;
    tooltip?: string;
    withCompactTitleSection?: boolean;
    withoutTitleSection?: boolean;
    withoutPadding?: boolean;
    withAsteriskOnTitle?: boolean;
    numPreferredColumns?: NumColumn;
}

function InputSection(props: Props) {
    const {
        className,
        title,
        children,
        description,
        tooltip,
        contentSectionClassName,
        withoutTitleSection = false,
        withCompactTitleSection,
        withoutPadding = false,
        withAsteriskOnTitle,
        numPreferredColumns = 1,
    } = props;

    return (
        <div
            className={_cs(
                styles.inputSection,
                withoutTitleSection && styles.withoutTitleSection,
                !withoutPadding && styles.withPadding,
                withCompactTitleSection && styles.withCompactTitleSection,
                className,
            )}
        >
            {!withoutTitleSection && (
                <Container
                    heading={title}
                    headingDescription={withAsteriskOnTitle && (
                        <span aria-hidden className={styles.asterisk}>
                            *
                        </span>
                    )}
                    headerClassName={styles.header}
                    headingClassName={styles.heading}
                    headingContainerClassName={styles.headingContainer}
                    actions={tooltip && <InfoPopup description={tooltip} />}
                    childrenContainerClassName={styles.description}
                    headingLevel={withCompactTitleSection ? 5 : 4}
                    spacing="cozy"
                >
                    {description}
                </Container>
            )}
            <div
                className={_cs(
                    styles.contentSection,
                    numPreferredColumns === 1 && styles.oneColumn,
                    numPreferredColumns === 2 && styles.twoColumn,
                    numPreferredColumns === 3 && styles.threeColumn,
                    numPreferredColumns === 4 && styles.fourColumn,
                    contentSectionClassName,
                )}
            >
                {children}
            </div>
        </div>
    );
}

export default InputSection;
