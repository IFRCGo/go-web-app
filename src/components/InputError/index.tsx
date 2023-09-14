import { useEffect, useRef, useState } from 'react';
import { AlertLineIcon } from '@ifrc-go/icons';
import { _cs, isNotDefined } from '@togglecorp/fujs';

import Popup from '#components/Popup';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    children?: React.ReactNode;
    disabled?: boolean;
}

function InputError(props: Props) {
    const {
        children,
        className,
        disabled,
    } = props;

    const [hasParentRef, setHasParentRef] = useState(false);

    const parentRef = useRef<HTMLElement>();
    const dummyRef = useRef<HTMLDivElement>(null);

    useEffect(
        () => {
            if (isNotDefined(dummyRef.current)) {
                return;
            }

            const {
                current: {
                    parentNode,
                },
            } = dummyRef;

            if (isNotDefined(parentNode)) {
                return;
            }

            parentRef.current = parentNode as HTMLElement;
            setHasParentRef(true);
        },
        [],
    );

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
                    parentRef={parentRef as React.RefObject<HTMLElement>}
                >
                    <AlertLineIcon className={styles.icon} />
                    {children}
                </Popup>
            )}
        </>
    );
}

export default InputError;
