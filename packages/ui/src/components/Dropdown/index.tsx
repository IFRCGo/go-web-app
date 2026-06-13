import {
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
} from 'react';
import {
    ArrowDownSmallFillIcon,
    ArrowUpSmallFillIcon,
} from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import Button, { Props as ButtonProps } from '#components/Button';
import Popover from '#components/Popover';
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
    /**
     * Value for the trigger's `aria-haspopup` (defaults to `'true'`).
     * Composing components set this to the kind of surface they reveal
     * (e.g. `'menu'`, `'dialog'`).
     */
    ariaHasPopup?: React.AriaAttributes['aria-haspopup'];
    /**
     * Accessible name for the trigger, applied as `aria-label`. Use when the
     * trigger has no visible text label (e.g. an icon-only affordance).
     */
    ariaLabel?: string;
    /** Imperative handle to open/close the dropdown programmatically */
    componentRef?: React.RefObject<{
        setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
    } | null>;
    /** Refers to the toggle button's root element (also used as the popover parent) */
    elementRef?: React.RefObject<HTMLDivElement | null>;
    /** Keeps the dropdown open when clicking inside the popover */
    persistent?: boolean;

    /** Renders the popover content; allows wrapping it (e.g. with menu roles) */
    popupContentRenderer?: (children: React.ReactNode) => React.ReactNode;
}

/**
 * Generic disclosure (generic layer).
 *
 * A real `<button>` trigger (with `aria-haspopup`/`aria-expanded`/
 * `aria-controls`) toggles a Popover holding arbitrary `children`. Escape and
 * outside-click close it. It carries no menu roles — composing components
 * (e.g. Menu, MoreInfo) layer their own semantics on top.
 */
function Dropdown(props: Props) {
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
        ariaHasPopup = 'true',
        ariaLabel,
        componentRef,
        elementRef: buttonRef = newButtonRef,
        persistent,

        popupClassName,
        preferredPopupWidth,
        withoutPopupPadding,

        popupContentRenderer,
    } = props;

    const popupId = useId();
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

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLButtonElement>) => {
            if (event.key === 'Escape') {
                setShowDropdown(false);
            }
        },
        [setShowDropdown],
    );

    useBlurEffect(
        showDropdown,
        handleBlurCallback,
        dropdownRef,
        buttonRef,
    );

    const hasAfterContent = !!labelAfter || !withoutDropdownIcon;

    return (
        <>
            <Button
                name={undefined}
                className={_cs(
                    styles.dropdown,
                    showDropdown && activeClassName,
                    className,
                )}
                elementRef={buttonRef}
                onClick={handleMenuClick}
                onKeyDown={handleKeyDown}
                aria-haspopup={ariaHasPopup}
                aria-expanded={showDropdown}
                aria-controls={showDropdown ? popupId : undefined}
                aria-label={ariaLabel}
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
                <Popover
                    id={popupId}
                    elementRef={dropdownRef}
                    className={_cs(
                        styles.dropdownContent,
                        withoutPopupPadding && styles.withoutPadding,
                        popupClassName,
                    )}
                    parentRef={buttonRef}
                    preferredWidth={preferredPopupWidth}
                >
                    {popupContentRenderer ? popupContentRenderer(children) : children}
                </Popover>
            )}
        </>
    );
}

export default Dropdown;
