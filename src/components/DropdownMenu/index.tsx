import {
    useState,
    useCallback,
    useRef,
    useEffect,
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
    componentRef?: React.MutableRefObject<{
        setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
    } | null>;
    elementRef?: React.RefObject<HTMLButtonElement>;
}

function DropdownMenu(props: Props) {
    const newButtonRef = useRef<HTMLButtonElement>(null);
    const {
        className,
        dropdownContainerClassName,
        children,
        label,
        activeClassName,
        icons,
        variant = 'secondary',
        actions,
        hideDropdownIcon,
        componentRef,
        elementRef: buttonRef = newButtonRef,
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
        (_, e) => {
            e.stopPropagation();
            setShowDropdown((prevValue) => !prevValue);
        },
        [setShowDropdown],
    );

    const handleBlurCallback = useCallback(
        (clickedInside: boolean, clickedInParent: boolean) => {
            const isClickedWithin = clickedInside || clickedInParent;
            if (isClickedWithin) {
                return;
            }
            setShowDropdown(false);
        },
        [setShowDropdown],
    );

    useBlurEffect(
        showDropdown,
        handleBlurCallback,
        dropdownRef,
        buttonRef,
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
