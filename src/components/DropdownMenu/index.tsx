import {
    useState,
    useCallback,
    useRef,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ArrowDownSmallFillIcon,
    ArrowUpSmallFillIcon,
} from '@ifrc-go/icons';

import Button from '#components/Button';
import Portal from '#components/Portal';
import Button from '#components/Button';
import useBlurEffect from '#hooks/useBlurEffect';
import useFloatPlacement from '#hooks/useFloatPlacement';

import styles from './styles.module.css';

interface DropdownProps {
    className?: string;
    elementRef: React.RefObject<HTMLElement>;
    parentRef: React.RefObject<HTMLElement>;
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
        <Portal>
            <div
                ref={elementRef as React.RefObject<HTMLDivElement>}
                style={placement}
                className={_cs(styles.menuContainer, className)}
            >
                {children}
            </div>
        </Portal>
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

    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
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

    useBlurEffect(
        showDropdown,
        handleBlurCallback,
        dropdownRef,
        buttonRef,
    );

    const conditionalIcons = useCallback(() => {
        const defaultIcons = showDropdown ? <ArrowUpSmallFillIcon /> : <ArrowDownSmallFillIcon />;
        if (icons) {
            return icons;
        }
        return defaultIcons;
    }, [icons, showDropdown]);

    return (
        <>
            <Button
                name={undefined}
                className={_cs(styles.dropdown,
                    className,
                    showDropdown && activeClassName
                )}
                elementRef={buttonRef}
                onClick={handleMenuClick}
            >
                {label}
                {' '}
                {conditionalIcons()}
            </Button>
            {showDropdown && (
                <Dropdown
                    elementRef={dropdownRef}
                    className={dropdownContainerClassName}
                    parentRef={buttonRef}
                >
                    {children}
                </Dropdown>
            )}
        </>
    );
}

export default DropdownMenu;
