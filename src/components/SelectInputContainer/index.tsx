import React, { useCallback, useRef } from 'react';
import { _cs, isTruthyString } from '@togglecorp/fujs';
import { ArrowDownSmallFillIcon, ArrowUpSmallFillIcon, CloseLineIcon } from '@ifrc-go/icons';

import Popup from '#components/Popup';
import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import RawInput from '#components/RawInput';
import Button from '#components/Button';
import List from '#components/List';
import useBlurEffect from '#hooks/useBlurEffect';
import useKeyboard from '#hooks/useKeyboard';

import GenericOption, { ContentBaseProps, OptionKey } from './GenericOption';
import OptionGroup from './OptionGroup';
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
        onClear: () => void;
    }, OMISSION>
    & Omit<InputContainerProps, 'input'>
    & ({
        grouped: true;
        groupLabelSelector: (option: OPTION) => string;
        groupKeySelector: (option: OPTION) => string | number;
    } | {
        grouped?: false;
        groupLabelSelector?: undefined;
        groupKeySelector?: undefined;
    })
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
        onClear,
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

    const handleToggleDropdown = useCallback(
        () => {
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
        [
            onDropdownShownChange,
        ],
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

    const groupRendererParams = useCallback(
        (_: string | number, __: number, values: OPTION[]) => ({
            // eslint-disable-next-line react/destructuring-assignment
            title: props.grouped ? props.groupLabelSelector(values[0]) : '?',
        }),
        // FIXME: disabling because linter is not smart enough
        // eslint-disable-next-line react-hooks/exhaustive-deps, react/destructuring-assignment
        [props.grouped, props.groupLabelSelector],
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

    let popup: React.ReactNode | null;
    // eslint-disable-next-line react/destructuring-assignment
    if (props.grouped) {
        popup = (
            <List
                data={options}
                keySelector={optionKeySelector}
                renderer={GenericOption}
                rendererParams={optionListRendererParams}
                grouped
                groupRenderer={OptionGroup}
                groupRendererParams={groupRendererParams}
                // eslint-disable-next-line react/destructuring-assignment
                groupKeySelector={props.groupKeySelector}
                errored={optionsErrored}
                filtered={optionsFiltered}
                pending={optionsPending}
                message={totalOptionsCount - optionsCount > 0 ? `and ${totalOptionsCount - optionsCount} more` : undefined}
                compact
            />
        );
    } else {
        popup = (
            <List
                data={options}
                keySelector={optionKeySelector}
                renderer={GenericOption}
                rendererParams={optionListRendererParams}
                errored={optionsErrored}
                filtered={optionsFiltered}
                pending={optionsPending}
                message={totalOptionsCount - optionsCount > 0 ? `and ${totalOptionsCount - optionsCount} more` : undefined}
                compact
            />
        );
    }

    return (
        <>
            <InputContainer
                containerRef={containerRef}
                inputSectionRef={inputSectionRef}
                actions={(
                    <>
                        {actions}
                        {!readOnly && !nonClearable && hasValue && (
                            <Button
                                onClick={onClear}
                                disabled={disabled}
                                variant="tertiary"
                                name={undefined}
                                title="Clear"
                            >
                                <CloseLineIcon />
                            </Button>
                        )}
                        {!readOnly && (
                            <Button
                                onClick={handleToggleDropdown}
                                variant="tertiary"
                                name={undefined}
                                title={dropdownShown ? 'Close' : 'Open'}
                            >
                                {dropdownShown
                                    ? <ArrowUpSmallFillIcon />
                                    : <ArrowDownSmallFillIcon />}
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
                    {popup}
                </Popup>
            )}
        </>
    );
}

export default SelectInputContainer;
