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
import Button, { Props as ButtonProps } from '#components/Button';
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
    icons?: React.ReactNode;
    variant?: ButtonProps<undefined>['variant'];
    actions?: React.ReactNode;
    hideDropdownIcon?: boolean;
}

function DropdownMenu(props: DropdownMenuProps) {
    const {
        className,
        dropdownContainerClassName,
        children,
        label,
        activeClassName,
        icons,
        variant,
        actions,
        hideDropdownIcon,
    } = props;

    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const handleMenuClick = useCallback((_: undefined) => {
        setShowDropdown((prevValue) => !prevValue);
    }, [setShowDropdown]);

    const handleBlurCallback = useCallback((clickedInside: boolean, clickedInParent: boolean) => {
        if (clickedInside || clickedInParent) {
            return;
        }

        setShowDropdown(false);
    }, [setShowDropdown]);

    useBlurEffect(
        showDropdown,
        handleBlurCallback,
        buttonRef,
        dropdownRef,
    );

    return (
        <>
            <Button
                name={undefined}
                className={_cs(className, showDropdown && activeClassName)}
                elementRef={buttonRef}
                onClick={handleMenuClick}
                variant={variant}
                actions={(
                    <>
                        {actions}
                        {!hideDropdownIcon && (showDropdown
                            ? <ArrowUpSmallFillIcon />
                            : <ArrowDownSmallFillIcon />
                        )}
                    </>
                )}
                icons={icons}
            >
                {label}
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
