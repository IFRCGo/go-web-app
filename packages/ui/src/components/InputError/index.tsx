import {
    useEffect,
    useRef,
    useState,
} from 'react';
import { AlertLineIcon } from '@ifrc-go/icons';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import InlineLayout from '#components/InlineLayout';
import Popover from '#components/Popover';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    children?: React.ReactNode;
    disabled?: boolean;
    floating?: boolean;
    /** Id wired from the field's `aria-describedby` */
    id?: string;
}

/**
 * Form-field error message (generic layer). Carries `role="alert"` so
 * validation errors are announced by assistive tech; can also float in
 * a Popover when `floating` is set.
 */
function InputError(props: Props) {
    const {
        children,
        className,
        disabled,
        floating,
        id,
    } = props;

    const [hasParentRef, setHasParentRef] = useState(false);

    const parentRef = useRef<HTMLElement | null>(null);
    const dummyRef = useRef<HTMLDivElement>(null);

    useEffect(
        () => {
            if (isNotDefined(dummyRef.current)) {
                return;
            }

            const {
                current: {
                    parentElement,
                },
            } = dummyRef;

            if (isNotDefined(parentElement)) {
                return;
            }

            parentRef.current = parentElement;
            // FIXME(frozenhelium): setState on mount signals parent DOM is available
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHasParentRef(true);
        },
        [],
    );

    const content = (
        <InlineLayout
            id={id}
            role="alert"
            className={styles.errorContent}
            before={(
                <AlertLineIcon className={styles.icon} />
            )}
            spacing="xs"
        >
            {children}
        </InlineLayout>
    );

    if (!floating) {
        return content;
    }

    return (
        <>
            {!hasParentRef && (
                <div
                    className={styles.tooltipDummy}
                    ref={dummyRef}
                />
            )}
            {children && !disabled && (
                <Popover
                    className={_cs(styles.inputError, className)}
                    pointerClassName={styles.pointer}
                    parentRef={parentRef}
                >
                    {content}
                </Popover>
            )}
        </>
    );
}

export default InputError;
