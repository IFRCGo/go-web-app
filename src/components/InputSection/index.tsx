import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface InputBaseProps {
  className?: string;
  title?: React.ReactNode;
  children?: React.ReactNode;
  description?: React.ReactNode;
  contentSectionClassName?: string;
  tooltip?: string;
  multiRow?: boolean;
  normalDescription?: boolean;
  descriptionContainerClassName?: string;
  fullWidthColumn?: boolean;
}

type Props = InputBaseProps & ({
  oneColumn: true;
  twoColumn?: never;
  threeColumn?: never;
} | {
  oneColumn?: never;
  twoColumn: true;
  threeColumn?: never;
} | {
  oneColumn?: never;
  twoColumn?: never;
  threeColumn: true;
} | {
  oneColumn?: never;
  twoColumn?: never;
  threeColumn?: never;
});

function InputSection(props: Props) {
    const {
        className,
        title,
        children,
        description,
        tooltip,
        multiRow,
        contentSectionClassName,
        descriptionContainerClassName,
        normalDescription,
        fullWidthColumn,
    } = props;

    return (
        <div className={_cs(
            className,
            styles.inputSection,
            multiRow && styles.multiRow,
            props.oneColumn && styles.oneColumn,
            props.twoColumn && styles.twoColumn,
            props.threeColumn && styles.threeColumn,
            !normalDescription && styles.specialDescription,
            fullWidthColumn && styles.fullWidthColumn,
        )}
        >
            <div
                className={styles.sectionTitle}
                title={tooltip}
            >
                {title && (
                    <div className={styles.title}>
                        {title}
                    </div>
                )}
                <div className={_cs(styles.description, descriptionContainerClassName)}>
                    {description}
                </div>
            </div>
            <div className={_cs(styles.sectionContent, contentSectionClassName)}>
                {children}
            </div>
        </div>
    );
}

export default InputSection;
