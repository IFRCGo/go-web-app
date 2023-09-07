import React, { useCallback, useRef } from 'react';
import { _cs, isTruthyString } from '@togglecorp/fujs';
import {
    ArrowDownSmallFillIcon,
    ArrowUpSmallFillIcon,
    CheckDoubleFillIcon,
    CloseLineIcon,
} from '@ifrc-go/icons';

import Popup from '#components/Popup';
import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import RawInput from '#components/RawInput';
import Button, { Props as ButtonProps } from '#components/Button';
import List from '#components/List';
import useBlurEffect from '#hooks/useBlurEffect';
import useKeyboard from '#hooks/useKeyboard';

import GenericOption, {
    ContentBaseProps,
    OptionKey,
    Props as GenericOptionProps,
} from './GenericOption';
import styles from './styles.module.css';

export type SelectInputContainerProps<
    OPTION_KEY extends OptionKey,
    NAME,
    OPTION,
    RENDER_PROPS extends ContentBaseProps,
    OMISSION extends string,
> = (
    Omit<{
        name: NAME,
        onOptionClick: (optionKey: OPTION_KEY, option: OPTION, name: NAME) => void;
        dropdownShown: boolean;
        onDropdownShownChange: (value: boolean) => void;
        focused: boolean;
        onFocusedChange: (value: boolean) => void;
        focusedKey: { key: OPTION_KEY, mouse?: boolean } | undefined;
        onFocusedKeyChange: (value: { key: OPTION_KEY, mouse?: boolean } | undefined) => void;
        searchText: string | undefined | null;
        onSearchTextChange: (search: string | undefined) => void;
        optionContainerClassName?: string;
        optionKeySelector: (datum: OPTION, index: number) => OPTION_KEY;
        optionRenderer: (
            props: Pick<RENDER_PROPS, Exclude<keyof RENDER_PROPS, keyof ContentBaseProps>>,
        ) => React.ReactNode;
        optionRendererParams: (optionKey: OPTION_KEY, option: OPTION) => RENDER_PROPS;
        totalOptionsCount?: number;
        options: OPTION[] | undefined | null;
        optionsPending?: boolean;
        optionsFiltered?: boolean;
        optionsErrored?: boolean;
        optionsPopupClassName?: string;
        persistentOptionPopup?: boolean;
        placeholder?: string;
        valueDisplay: string;
        autoFocus?: boolean;
        hasValue: boolean;
        nonClearable?: boolean;
        onClearButtonClick: () => void;
        onSelectAllButtonClick?: () => void;
    }, OMISSION>
    & Omit<InputContainerProps, 'input'>
);

const emptyList: unknown[] = [];

// eslint-disable-next-line @typescript-eslint/ban-types, max-len
function SelectInputContainer<
    OPTION_KEY extends OptionKey,
    const NAME,
    OPTION extends object,
    RENDER_PROPS extends ContentBaseProps
>(
    props: SelectInputContainerProps<OPTION_KEY, NAME, OPTION, RENDER_PROPS, never>,
) {
    const {
        actions,
        actionsContainerClassName,
        className,
        disabled,
        error,
        errorContainerClassName,
        hint,
        hintContainerClassName,
        icons,
        iconsContainerClassName,
        inputSectionClassName,
        label,
        labelClassName,
        name,
        onOptionClick,
        searchText,
        onSearchTextChange,
        optionContainerClassName,
        optionKeySelector,
        optionRenderer,
        optionRendererParams,
        options: optionsFromProps,
        optionsPopupClassName,
        persistentOptionPopup,
        readOnly,
        placeholder,
        valueDisplay = '',
        nonClearable,
        onClearButtonClick,
        onSelectAllButtonClick,
        optionsPending = false,
        optionsFiltered = false,
        optionsErrored = false,
        focused,
        focusedKey,
        onFocusedKeyChange,
        onFocusedChange,
        dropdownShown,
        onDropdownShownChange,
        totalOptionsCount = 0,
        hasValue,
        autoFocus,
    } = props;

    const options = optionsFromProps ?? (emptyList as OPTION[]);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputSectionRef = useRef<HTMLDivElement>(null);
    const inputElementRef = useRef<HTMLInputElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    const handleSearchInputChange = useCallback(
        (value: string | undefined) => {
            if (!dropdownShown) {
                onDropdownShownChange(true);
            }
            onSearchTextChange(value);
        },
        [
            dropdownShown,
            onDropdownShownChange,
            onSearchTextChange,
        ],
    );

    const handleToggleDropdown: NonNullable<ButtonProps<undefined>['onClick']> = useCallback(
        (_, e) => {
            e.stopPropagation();
            onDropdownShownChange(!dropdownShown);
        },
        [dropdownShown, onDropdownShownChange],
    );

    const handleShowDropdown = useCallback(
        () => {
            // FIXME: this is not atomic
            // FIXME: call only once
            if (!dropdownShown) {
                onDropdownShownChange(true);
            }
        },
        [
            dropdownShown,
            onDropdownShownChange,
        ],
    );

    const handleHideDropdown = useCallback(
        () => {
            onDropdownShownChange(false);
        },
        [onDropdownShownChange],
    );

    const handleSearchInputClick = useCallback(
        () => {
            if (readOnly) {
                return;
            }
            handleShowDropdown();
        },
        [readOnly, handleShowDropdown],
    );

    const handlePopupBlur = useCallback(
        (clickedInside: boolean, clickedInParent: boolean) => {
            const isClickedWithin = clickedInside || clickedInParent;
            if (!isClickedWithin) {
                handleHideDropdown();
            } else if (persistentOptionPopup && inputElementRef.current) {
                inputElementRef.current.focus();
            }
        },
        [handleHideDropdown, persistentOptionPopup],
    );

    const handleOptionClick = useCallback(
        (valueKey: OPTION_KEY, value: OPTION) => {
            onOptionClick(valueKey, value, name);
            if (!persistentOptionPopup) {
                handleHideDropdown();
            }
        },
        [onOptionClick, handleHideDropdown, persistentOptionPopup, name],
    );

    const optionListRendererParams = useCallback(
        (key: OPTION_KEY, option: OPTION) => ({
            contentRendererParam: optionRendererParams,
            option,
            optionKey: key,
            focusedKey,
            contentRenderer: optionRenderer,
            onClick: handleOptionClick,
            onFocus: onFocusedKeyChange,
            optionContainerClassName: _cs(optionContainerClassName, styles.listItem),
        }),
        [
            focusedKey,
            handleOptionClick,
            onFocusedKeyChange,
            optionContainerClassName,
            optionRenderer,
            optionRendererParams,
        ],
    );

    useBlurEffect(
        dropdownShown,
        handlePopupBlur,
        popupRef,
        containerRef,
    );

    const handleKeyDown = useKeyboard(
        focusedKey,
        optionKeySelector,
        options,
        dropdownShown,

        onFocusedKeyChange,
        handleHideDropdown,
        handleShowDropdown,
        handleOptionClick,
    );

    const optionsCount = options.length;

    // FIXME: use translation
    const infoMessage = totalOptionsCount - optionsCount > 0
        ? `and ${totalOptionsCount - optionsCount} more`
        : undefined;

    return (
        <>
            <InputContainer
                containerRef={containerRef}
                inputSectionRef={inputSectionRef}
                actions={(
                    <>
                        {actions}
                        {!readOnly && onSelectAllButtonClick && (
                            <Button
                                onClick={onSelectAllButtonClick}
                                disabled={disabled}
                                variant="tertiary"
                                name={undefined}
                                // FIXME use translation
                                title="Select all"
                            >
                                <CheckDoubleFillIcon className={styles.icon} />
                            </Button>
                        )}
                        {!readOnly && !nonClearable && hasValue && (
                            <Button
                                onClick={onClearButtonClick}
                                disabled={disabled}
                                variant="tertiary"
                                name={undefined}
                                // FIXME use translation
                                title="Clear"
                            >
                                <CloseLineIcon className={styles.icon} />
                            </Button>
                        )}
                        {!readOnly && (
                            <Button
                                onClick={handleToggleDropdown}
                                variant="tertiary"
                                name={undefined}
                                // FIXME use translation
                                title={dropdownShown ? 'Close' : 'Open'}
                            >
                                {dropdownShown
                                    ? <ArrowUpSmallFillIcon className={styles.icon} />
                                    : <ArrowDownSmallFillIcon className={styles.icon} />}
                            </Button>
                        )}
                    </>
                )}
                actionsContainerClassName={actionsContainerClassName}
                className={className}
                disabled={disabled}
                error={error}
                errorContainerClassName={errorContainerClassName}
                hint={hint}
                hintContainerClassName={hintContainerClassName}
                icons={icons}
                iconsContainerClassName={iconsContainerClassName}
                inputSectionClassName={inputSectionClassName}
                label={label}
                labelClassName={labelClassName}
                readOnly={readOnly}
                input={(
                    <RawInput
                        name={name}
                        elementRef={inputElementRef}
                        readOnly={readOnly}
                        disabled={disabled}
                        value={(dropdownShown || focused) ? searchText : valueDisplay}
                        onChange={handleSearchInputChange}
                        onClick={handleSearchInputClick}
                        onFocus={() => onFocusedChange(true)}
                        onBlur={() => onFocusedChange(false)}
                        placeholder={isTruthyString(valueDisplay) ? valueDisplay : placeholder}
                        autoComplete="off"
                        onKeyDown={handleKeyDown}
                        autoFocus={autoFocus}
                    />
                )}
            />
            {dropdownShown && (
                <Popup
                    elementRef={popupRef}
                    parentRef={inputSectionRef}
                    className={_cs(optionsPopupClassName, styles.popup)}
                >
                    <List<OPTION, OPTION_KEY, GenericOptionProps<RENDER_PROPS, OPTION_KEY, OPTION>>
                        className={styles.list}
                        data={options}
                        keySelector={optionKeySelector}
                        renderer={GenericOption}
                        rendererParams={optionListRendererParams}
                        errored={optionsErrored}
                        filtered={optionsFiltered}
                        pending={optionsPending}
                        // FIXME: use translations
                        pendingMessage="Fetching options..."
                        // FIXME: use translations
                        emptyMessage="No option available"
                        // FIXME: use translations
                        filteredMessage="No option available for the search"
                        // FIXME: use translations
                        errorMessage="Could not load options"
                        compact
                    />
                    {!optionsPending && !optionsErrored && !!infoMessage && (
                        <div className={styles.infoMessage}>
                            {infoMessage}
                        </div>
                    )}
                </Popup>
            )}
        </>
    );
}

export default SelectInputContainer;
