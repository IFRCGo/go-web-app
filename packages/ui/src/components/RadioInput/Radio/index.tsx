import React, { useId } from 'react';
import {
    CheckboxBlankCircleLineIcon,
    RadioButtonLineIcon,
} from '@ifrc-go/icons';

import ButtonLayout from '#components/ButtonLayout';
import Description from '#components/Description';
import Label from '#components/Label';
import ListView from '#components/ListView';
import { SpacingType } from '#utils/style';

import styles from './styles.module.css';

export interface Props<NAME> {
    name: NAME;
    onClick: (name: NAME) => void;

    className?: string;
    description?: React.ReactNode;

    value: boolean;

    disabled?: boolean;
    readOnly?: boolean;

    inputName?: string;
    spacing?: SpacingType;

    children?: React.ReactNode;
    after?: React.ReactNode;
}

function Radio<NAME>(props: Props<NAME>) {
    const {
        name,
        description,
        className,
        value,
        onClick,
        disabled,
        readOnly,
        inputName,
        spacing,
        children,
        after,
    } = props;

    const handleClick = React.useCallback(() => {
        if (onClick && !disabled && !readOnly) {
            onClick(name);
        }
    }, [disabled, name, onClick, readOnly]);

    const inputId = useId();

    return (
        <label
            className={styles.radio}
            htmlFor={inputId}
        >
            <ButtonLayout
                before={value ? (
                    <RadioButtonLineIcon className={styles.activeIcon} />
                ) : (
                    <CheckboxBlankCircleLineIcon />
                )}
                className={className}
                spacingOffset={-3}
                spacing={spacing}
                after={after}
                withoutPadding
                colorVariant="text"
                styleVariant="action"
            >
                <ListView
                    layout="block"
                    withSpacingOpticalCorrection
                    spacingOffset={-3}
                    spacing={spacing}
                >
                    <Label>
                        {children}
                    </Label>
                    <Description textSize="sm">
                        {description}
                    </Description>
                </ListView>
            </ButtonLayout>
            <input
                id={inputId}
                className={styles.input}
                type="radio"
                name={typeof inputName === 'string' ? inputName : undefined}
                checked={value}
                onClick={handleClick}
                disabled={disabled}
                readOnly
            />
        </label>
    );
}

export default Radio;
