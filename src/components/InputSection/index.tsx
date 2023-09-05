import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

type NumColumn = 1 | 2 | 3;
export interface Props {
    className?: string;
    title?: React.ReactNode;
    children?: React.ReactNode;
    description?: React.ReactNode;
    contentSectionClassName?: string;
    tooltip?: string;
    descriptionContainerClassName?: string;
    withoutTitleSection?: boolean;
    titleClassName?: string;
    withoutPadding?: boolean;
    withAsteriskOnTitle?: boolean;
    numPreferredColumns?: NumColumn;
}

// FIXME: simplify props, responsive styling
function InputSection(props: Props) {
    const {
        className,
        title,
        children,
        description,
        tooltip,
        contentSectionClassName,
        descriptionContainerClassName,
        titleClassName,
        withoutTitleSection = false,
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
                className,
            )}
        >
            {!withoutTitleSection && (
                <div
                    className={styles.titleSection}
                    title={tooltip}
                >
                    {title && (
                        <div className={_cs(styles.title, titleClassName)}>
                            {title}
                            {withAsteriskOnTitle && (
                                <span aria-hidden className={styles.asterisk}>
                                    *
                                </span>
                            )}
                        </div>
                    )}
                    <div className={_cs(styles.description, descriptionContainerClassName)}>
                        {description}
                    </div>
                </div>
            )}
            <div
                className={_cs(
                    styles.contentSection,
                    numPreferredColumns === 1 && styles.oneColumn,
                    numPreferredColumns === 2 && styles.twoColumn,
                    numPreferredColumns === 3 && styles.threeColumn,
                    contentSectionClassName,
                )}
            >
                {children}
            </div>
        </div>
    );
}

export default InputSection;
