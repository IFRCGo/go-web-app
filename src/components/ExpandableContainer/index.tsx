import { useRef, useEffect } from 'react';
import { _cs } from '@togglecorp/fujs';
import { ChevronDownLineIcon, ChevronUpLineIcon } from '@ifrc-go/icons';

import useBoolean from '#hooks/useBoolean';

import Container, { Props as ContainerProps } from '../Container';
import styles from './styles.module.css';

export interface Props extends ContainerProps {
    initiallyExpanded?: boolean;
    componentRef?: React.MutableRefObject<{
        setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    } | null>;
}

function ExpandableContainer(props: Props) {
    const {
        className,
        children,
        actions,
        initiallyExpanded = false,
        headerClassName,
        componentRef,
        ...otherProps
    } = props;

    const headerRef = useRef<HTMLDivElement>(null);

    const [
        showChildren,
        {
            setValue,
            toggle,
        },
    ] = useBoolean(!!initiallyExpanded);

    useEffect(() => {
        if (componentRef) {
            componentRef.current = {
                setIsExpanded: setValue,
            };
        }
    }, [componentRef, setValue]);

    useEffect(() => {
        const { current: headerElement } = headerRef;
        if (headerElement) {
            headerElement.addEventListener('click', toggle);
        }

        return () => {
            if (headerElement) {
                headerElement.removeEventListener('click', toggle);
            }
        };
    }, [toggle]);

    return (
        <Container
            className={_cs(styles.expandableContainer, className)}
            headerElementRef={headerRef}
            headerClassName={_cs(styles.header, headerClassName)}
            actions={(
                <>
                    {actions}
                    {showChildren ? (
                        <ChevronUpLineIcon />
                    ) : (
                        <ChevronDownLineIcon />
                    )}
                </>
            )}
            {...otherProps} // eslint-disable-line react/jsx-props-no-spreading
        >
            {showChildren && children}
        </Container>
    );
}

export default ExpandableContainer;
