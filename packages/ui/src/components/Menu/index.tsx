import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import { Props as ButtonProps } from '#components/Button';
import Dropdown from '#components/Dropdown';
import MenuContext, { type MenuContextProps } from '#contexts/menu';
import { SpacingType } from '#utils/style';

import styles from './styles.module.css';

type DropdownHandle = {
    setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
};

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
    /** Accessible name for the trigger when it has no visible text label */
    ariaLabel?: string;
    /** Imperative handle to open/close the menu programmatically */
    componentRef?: React.RefObject<DropdownHandle | null>;
    /** Refers to the toggle button's root element (also used as the popover parent) */
    elementRef?: React.RefObject<HTMLDivElement | null>;
    /** Keeps the menu open when clicking inside the popover */
    persistent?: boolean;
}

/**
 * Action menu (specific layer).
 *
 * Composes the generic Dropdown disclosure and layers menu semantics on top:
 * the trigger advertises `aria-haspopup="menu"`, the popover content gets
 * `role="menu"`, and each child is wrapped in a `role="menuitem"`. Escape and
 * outside-click close it. Items can close the menu via `MenuContext`.
 */
function Menu(props: Props) {
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
        ariaLabel,
        componentRef,
        elementRef,
        persistent,

        popupClassName,
        preferredPopupWidth,
        withoutPopupPadding,
    } = props;

    const dropdownHandleRef = useRef<DropdownHandle | null>(null);

    // Mirror the Dropdown imperative handle onto the public componentRef.
    useEffect(() => {
        if (componentRef) {
            componentRef.current = dropdownHandleRef.current;
        }
    });

    // Stable proxy so MenuContext consumers (e.g. menu items) can close the
    // menu without depending on the Dropdown handle being populated yet.
    const setShowDropdown = useCallback<MenuContextProps['setShowDropdown']>(
        (value) => {
            dropdownHandleRef.current?.setShowDropdown(value);
        },
        [],
    );

    const contextValue = useMemo<MenuContextProps>(
        () => ({
            setShowDropdown,
        }),
        [setShowDropdown],
    );

    // The container carries `role="menu"`; the interactive `role="menuitem"`
    // belongs on each item's own focusable element (app-side DropdownMenuItem),
    // not on a wrapper, so children are rendered as-is.
    // FIXME(a11y-tier2): add arrow-key roving tabindex and type-ahead between
    // menu items (only basic menu roles + Escape are wired here).
    const renderMenuContent = useCallback(
        (content: React.ReactNode) => (
            <div role="menu">
                {content}
            </div>
        ),
        [],
    );

    return (
        <MenuContext.Provider value={contextValue}>
            <Dropdown
                className={_cs(styles.menu, className)}
                activeClassName={activeClassName}
                componentRef={dropdownHandleRef}
                elementRef={elementRef}
                persistent={persistent}
                label={label}
                labelBefore={labelBefore}
                labelAfter={labelAfter}
                labelSpacing={labelSpacing}
                labelVariant={labelVariant}
                labelWithoutPadding={labelWithoutPadding}
                withoutDropdownIcon={withoutDropdownIcon}
                ariaLabel={ariaLabel}
                ariaHasPopup="menu"
                popupClassName={popupClassName}
                preferredPopupWidth={preferredPopupWidth}
                withoutPopupPadding={withoutPopupPadding}
                popupContentRenderer={renderMenuContent}
            >
                {children}
            </Dropdown>
        </MenuContext.Provider>
    );
}

export default Menu;
