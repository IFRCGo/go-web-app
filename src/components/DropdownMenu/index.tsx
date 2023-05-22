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

import Popup from '#components/Popup';
import Button, { Props as ButtonProps } from '#components/Button';
import useBlurEffect from '#hooks/useBlurEffect';

export interface Props {
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

function DropdownMenu(props: Props) {
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
    const handleMenuClick = useCallback(() => {
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
                <Popup
                    elementRef={dropdownRef}
                    className={dropdownContainerClassName}
                    parentRef={buttonRef}
                >
                    {children}
                </Popup>
            )}
        </>
    );
}

export default DropdownMenu;
