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
import Popup from '#components/Popup';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    children?: React.ReactNode;
    disabled?: boolean;
    floating?: boolean;
}

function InputError(props: Props) {
    const {
        children,
        className,
        disabled,
        floating,
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
                <Popup
                    className={_cs(styles.inputError, className)}
                    pointerClassName={styles.pointer}
                    parentRef={parentRef}
                >
                    {content}
                </Popup>
            )}
        </>
    );
}

export default InputError;
