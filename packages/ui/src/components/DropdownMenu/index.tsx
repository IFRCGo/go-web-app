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

import styles from './styles.module.css';

export interface Props {
    className?: string;
    popupClassName?: string;
    preferredPopupWidth?: number;
    children?: React.ReactNode;
    label?: React.ReactNode;
    activeClassName?: string;
    icons?: React.ReactNode;
    variant?: ButtonProps<undefined>['variant'];
    actions?: React.ReactNode;
    withoutDropdownIcon?: boolean;
    componentRef?: React.MutableRefObject<{
        setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
    } | null>;
    elementRef?: React.RefObject<HTMLButtonElement>;
    persistent?: boolean;
}

function DropdownMenu(props: Props) {
    const newButtonRef = useRef<HTMLButtonElement>(null);
    const {
        className,
        popupClassName,
        children,
        label,
        activeClassName,
        icons,
        variant = 'secondary',
        actions,
        withoutDropdownIcon,
        componentRef,
        elementRef: buttonRef = newButtonRef,
        persistent,
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

    const hasActions = !!actions || !withoutDropdownIcon;

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
                variant={variant}
                actionsContainerClassName={styles.actions}
                iconsContainerClassName={styles.icons}
                childrenContainerClassName={styles.content}
                actions={hasActions ? (
                    <>
                        {actions}
                        {!withoutDropdownIcon && (showDropdown
                            ? <ArrowUpSmallFillIcon className={styles.dropdownIcon} />
                            : <ArrowDownSmallFillIcon className={styles.dropdownIcon} />
                        )}
                    </>
                ) : undefined}
                icons={icons}
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
