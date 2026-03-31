import React from 'react';
import { _cs } from '@togglecorp/fujs';

import ListView from '#components/ListView';
import {
    TabColorVariant,
    TabStyleVariant,
} from '#contexts/tab';
import { SpacingType } from '#utils/style';

import styles from './styles.module.css';

export interface Props extends React.HTMLProps<HTMLDivElement> {
    elementRef?: React.RefObject<HTMLDivElement>;
    className?: string;
    spacing?: SpacingType;
    children: React.ReactNode;
    styleVariant?: TabStyleVariant;
    colorVariant?: TabColorVariant;
    disabled?: boolean;
}

function TabListLayout(props: Props) {
    const {
        styleVariant,
        colorVariant,
        disabled,
        elementRef,
        children,
        className,
        spacing,
        ...otherProps
    } = props;

    return (
        <div
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            ref={elementRef}
            className={_cs(
                className,
                styles.tabListLayout,
                disabled && styles.disabled,

                colorVariant === 'primary' && styles.colorVariantPrimary,
                colorVariant === 'secondary' && styles.colorVariantSecondary,
                colorVariant === 'text' && styles.colorVariantText,

                styleVariant === 'tab' && styles.styleVariantTab,
                styleVariant === 'pill' && styles.styleVariantPill,
                styleVariant === 'step' && styles.styleVariantStep,
                styleVariant === 'nav' && styles.styleVariantNav,
                styleVariant === 'vertical' && styles.styleVariantVertical,
                styleVariant === 'vertical-compact' && styles.styleVariantVerticalCompact,
            )}
        >
            <div className={styles.additionalBorder} />
            {(styleVariant === 'vertical' || styleVariant === 'vertical-compact') ? (
                <ListView
                    layout="block"
                    role="tablist"
                    spacing={styleVariant === 'vertical' ? 'none' : spacing}
                    withSpacingOpticalCorrection={styleVariant === 'vertical-compact'}
                >
                    {children}
                </ListView>
            ) : (
                <ListView
                    className={styles.content}
                    // spacing="none"
                    // withWrap={styleVariant !== 'tab'}
                    spacing={(styleVariant === 'tab' || styleVariant === 'pill' || styleVariant === 'step')
                        ? 'none'
                        : spacing}
                    role="tablist"
                    withWrap={styleVariant === 'nav'}
                    withSpacingOpticalCorrection
                >
                    {children}
                </ListView>
            )}
            <div className={styles.additionalBorder} />
        </div>
    );
}

export default TabListLayout;
