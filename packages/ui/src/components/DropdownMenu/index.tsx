import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    ArrowDownSmallFillIcon,
    ArrowUpSmallFillIcon,
} from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import Button, { Props as ButtonProps } from '#components/Button';
import Popup from '#components/Popup';
import DropdownMenuContext, { type DropdownMenuContextProps } from '#contexts/dropdown-menu';
import useBlurEffect from '#hooks/useBlurEffect';
import { SpacingType } from '#utils/style';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    activeClassName?: string;

    popupClassName?: string;
    preferredPopupWidth?: number;

    label?: React.ReactNode;
    labelBefore?: React.ReactNode;
    labelAfter?: React.ReactNode;
    labelSpacing?: SpacingType;
    labelColorVariant?: ButtonProps<undefined>['colorVariant'];
    labelStyleVariant?: ButtonProps<undefined>['styleVariant'];
    labelWithoutPadding?: boolean;

    children?: React.ReactNode;

    withoutDropdownIcon?: boolean;
    componentRef?: React.MutableRefObject<{
        setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
    } | null>;
    elementRef?: React.RefObject<HTMLDivElement>;
    persistent?: boolean;
}

function DropdownMenu(props: Props) {
    const newButtonRef = useRef<HTMLDivElement>(null);
    const {
        className,
        activeClassName,

        children,

        label,
        labelBefore,
        labelAfter,
        labelSpacing,
        labelColorVariant,
        labelStyleVariant,
        labelWithoutPadding,

        withoutDropdownIcon,
        componentRef,
        elementRef: buttonRef = newButtonRef,
        persistent,

        popupClassName,
        preferredPopupWidth,
    } = props;

    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (componentRef) {
            componentRef.current = {
                setShowDropdown,
            };
        }
    }, [componentRef, setShowDropdown]);

    const handleMenuClick: NonNullable<ButtonProps<undefined>['onClick']> = useCallback(
        () => {
            setShowDropdown((prevValue) => !prevValue);
        },
        [setShowDropdown],
    );

    const handleBlurCallback = useCallback(
        (clickedInside: boolean, clickedInParent: boolean) => {
            // const isClickedWithin = clickedInside || clickedInParent;
            if (clickedInParent) {
                return;
            }

            if (clickedInside && persistent) {
                return;
            }

            setShowDropdown(false);
        },
        [setShowDropdown, persistent],
    );

    useBlurEffect(
        showDropdown,
        handleBlurCallback,
        dropdownRef,
        buttonRef,
    );

    const contextValue = useMemo<DropdownMenuContextProps>(
        () => ({
            setShowDropdown,
        }),
        [setShowDropdown],
    );

    const hasAfterContent = !!labelAfter || !withoutDropdownIcon;

    return (
        <DropdownMenuContext.Provider value={contextValue}>
            <Button
                name={undefined}
                className={_cs(
                    showDropdown && activeClassName,
                    className,
                )}
                layoutElementRef={buttonRef}
                onClick={handleMenuClick}
                styleVariant={labelStyleVariant}
                colorVariant={labelColorVariant}
                withoutPadding={labelWithoutPadding}
                spacing={labelSpacing}
                after={hasAfterContent ? (
                    <>
                        {labelAfter}
                        {!withoutDropdownIcon && (showDropdown
                            ? <ArrowUpSmallFillIcon className={styles.dropdownIcon} />
                            : <ArrowDownSmallFillIcon className={styles.dropdownIcon} />
                        )}
                    </>
                ) : undefined}
                before={labelBefore}
            >
                {label}
            </Button>
            {showDropdown && (
                <Popup
                    elementRef={dropdownRef}
                    className={_cs(styles.dropdownContent, popupClassName)}
                    parentRef={buttonRef}
                    preferredWidth={preferredPopupWidth}
                >
                    {children}
                </Popup>
            )}
        </DropdownMenuContext.Provider>
    );
}

export default DropdownMenu;
