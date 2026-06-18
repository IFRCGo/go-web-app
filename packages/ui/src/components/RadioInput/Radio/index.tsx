import React, { useId } from 'react';
import {
    CheckboxBlankCircleLineIcon,
    RadioButtonLineIcon,
} from '@ifrc-go/icons';

import ButtonLayout from '#components/ButtonLayout';
import Description from '#components/Description';
import DisplayLabel from '#components/DisplayLabel';
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

    // Native radios fire `change` on selection (keyboard arrow keys, and a
    // click on an unselected radio), so selection is wired through onChange to
    // stay keyboard-operable.
    const handleChange = React.useCallback(() => {
        if (onClick && !disabled && !readOnly) {
            onClick(name);
        }
    }, [disabled, name, onClick, readOnly]);

    // A native radio does not fire `change` when the already-selected radio is
    // re-clicked, so handle that case here to preserve the clearable behaviour
    // (RadioInput toggles the value off). Guarded to the selected radio so an
    // unselected click is not double-handled alongside onChange.
    const handleClick = React.useCallback(() => {
        if (value && onClick && !disabled && !readOnly) {
            onClick(name);
        }
    }, [value, disabled, name, onClick, readOnly]);

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
                    <CheckboxBlankCircleLineIcon className={styles.blankIcon} />
                )}
                className={className}
                spacingOffset={-4}
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
                    <DisplayLabel>
                        {children}
                    </DisplayLabel>
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
                onChange={handleChange}
                onClick={handleClick}
                disabled={disabled}
            />
        </label>
    );
}

export default Radio;
