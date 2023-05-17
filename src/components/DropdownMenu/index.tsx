import React, {
    useState,
    useCallback,
    useRef,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoCaretDownSharp, IoCaretForward } from 'react-icons/io5';
import useBlurEffect from '#hooks/useBlurEffect';
import useFloatPlacement from '#hooks/useFloatPlacement';

import Portal from '#components/Portal';
import styles from './styles.module.css';

interface DropdownProps {
    className?: string;
    elementRef: React.MutableRefObject<null>;
    parentRef: React.MutableRefObject<null>;
    children?: React.ReactNode;
}

function Dropdown(props: DropdownProps) {
    const {
        parentRef,
        elementRef,
        children,
        className,
    } = props;

    const placement = useFloatPlacement(parentRef);

    return (
        <div
            ref={elementRef}
            style={placement}
            className={_cs(styles.menuContainer, className)}
        >
            {children}
        </div>
    );
}

interface DropdownMenuProps {
    className?: string;
    dropdownContainerClassName?: string;
    children?: React.ReactNode;
    label?: React.ReactNode;
    activeClassName?: string;
    persistent?: boolean;
    icons?: React.ReactNode;
}

function DropdownMenu(props: DropdownMenuProps) {
    const {
        className,
        dropdownContainerClassName,
        children,
        label,
        activeClassName,
        persistent,
        icons,
    } = props;

    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const handleMenuClick = useCallback(() => {
        setShowDropdown(true);
    }, [setShowDropdown]);

    const handleBlurCallback = useCallback((insideClick: boolean) => {
        if (persistent && insideClick) {
            return;
        }
        setShowDropdown(false);
    }, [setShowDropdown, persistent]);

    useBlurEffect(showDropdown, handleBlurCallback, dropdownRef, buttonRef);

    const conditionalIcons = useCallback(() => {
        const defaultIcons = showDropdown ? <IoCaretDownSharp /> : <IoCaretForward />;
        if (icons) {
            return icons;
        }
        return defaultIcons;
    }, [icons, showDropdown]);

    return (
        <>
            <button
                className={_cs(styles.dropdown, className, showDropdown && activeClassName)}
                ref={buttonRef}
                onClick={handleMenuClick}
            >
                {label}
                {' '}
                {conditionalIcons()}
            </button>
            {showDropdown && (
                <Portal>
                    <Dropdown
                        elementRef={dropdownRef}
                        className={dropdownContainerClassName}
                        parentRef={buttonRef}
                    >
                        {children}
                    </Dropdown>
                </Portal>
            )}
        </>
    );
}

export default DropdownMenu;
