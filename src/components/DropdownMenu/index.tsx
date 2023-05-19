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

import Portal from '#components/Portal';
import Button from '#components/Button';
import useBlurEffect from '#hooks/useBlurEffect';
import useFloatPlacement from '#hooks/useFloatPlacement';

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
    console.info(placement);

    return (
        <Portal>
            <div
                ref={elementRef}
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

    return (
        <>
            <Button
                name={undefined}
                className={_cs(styles.dropdownButton, className, showDropdown && activeClassName)}
                elementRef={buttonRef}
                onClick={handleMenuClick}
            >
                {label}
                {icons ?? showDropdown
                    ? <ArrowUpSmallFillIcon />
                    : <ArrowDownSmallFillIcon />}
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
