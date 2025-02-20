import React, { useCallback } from 'react';
import { CloseFillIcon } from '@ifrc-go/icons';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import IconButton from '#components/IconButton';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export type ChipVariant = 'primary' | 'secondary' | 'tertiary';

const chipVariantToClassNameMap: Record<ChipVariant, string> = {
    primary: styles.primary,
    secondary: styles.secondary,
    tertiary: styles.tertiary,
};
export interface Props<N> {
    className?: string;
    name: N;
    label: React.ReactNode;
    variant?: ChipVariant;
    onDelete?: (name: N, e: React.MouseEvent<HTMLButtonElement>) => void;
}

function Chip<const N>(props: Props<N>) {
    const {
        className,
        name,
        label,
        variant = 'primary',
        onDelete,
    } = props;

    const strings = useTranslation(i18n);

    const handleDeleteButtonClick = useCallback((n: N, e: React.MouseEvent<HTMLButtonElement>) => {
        if (onDelete) {
            onDelete(n, e);
        }
    }, [onDelete]);

    return (
        <div className={_cs(
            styles.chip,
            chipVariantToClassNameMap[variant],
            isNotDefined(onDelete) && styles.noDeleteIcon,
            className,
        )}
        >
            <span>
                {label}
            </span>
            {isDefined(onDelete) && (
                <IconButton
                    className={styles.closeIcon}
                    spacing="none"
                    name={name}
                    title={strings.deleteButtonLabel}
                    ariaLabel={strings.deleteButtonLabel}
                    onClick={handleDeleteButtonClick}
                    variant={variant}
                >
                    <CloseFillIcon />
                </IconButton>
            )}
        </div>
    );
}

export default Chip;
