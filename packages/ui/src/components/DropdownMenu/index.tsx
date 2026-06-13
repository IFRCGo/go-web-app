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
    /** Applied to the toggle button while the dropdown is open */
    activeClassName?: string;

    popupClassName?: string;
    withoutPopupPadding?: boolean;
    preferredPopupWidth?: number;

    label?: React.ReactNode;
    labelBefore?: React.ReactNode;
    labelAfter?: React.ReactNode;
    labelSpacing?: SpacingType;
    /** Curated Button variant for the toggle button */
    labelVariant?: ButtonProps<undefined>['variant'];
    labelWithoutPadding?: boolean;

    children?: React.ReactNode;

    withoutDropdownIcon?: boolean;
    /** Imperative handle to open/close the dropdown programmatically */
    componentRef?: React.RefObject<{
        setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
    } | null>;
    /** Refers to the toggle button's root element (also used as the popup parent) */
    elementRef?: React.RefObject<HTMLDivElement | null>;
    /** Keeps the dropdown open when clicking inside the popup */
    persistent?: boolean;
}

/**
 * Toggle button with an attached popup menu (specific layer).
 *
 * Renders a Button (configured through the label* props, including the
 * curated `labelVariant`) that toggles a Popup containing `children`.
 */
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
        labelVariant,
        labelWithoutPadding,

        withoutDropdownIcon,
        componentRef,
        elementRef: buttonRef = newButtonRef,
        persistent,

        popupClassName,
        preferredPopupWidth,
        withoutPopupPadding,
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
                    styles.dropdownMenu,
                    showDropdown && activeClassName,
                    className,
                )}
                elementRef={buttonRef}
                onClick={handleMenuClick}
                variant={labelVariant}
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
                    className={_cs(
                        styles.dropdownContent,
                        withoutPopupPadding && styles.withoutPadding,
                        popupClassName,
                    )}
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
