import { useEffect } from 'react';
import { _cs } from '@togglecorp/fujs';
import { ChevronDownLineIcon, ChevronUpLineIcon } from '@ifrc-go/icons';

import useBooleanState from '#hooks/useBooleanState';
import Button from '#components/Button';

import Container, { Props as ContainerProps } from '../Container';
import styles from './styles.module.css';

export interface Props extends Omit<ContainerProps, 'withInternalPadding'> {
    initiallyExpanded?: boolean;
    onExpansionChange?: (isExpanded: boolean) => void;
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
        childrenContainerClassName,
        onExpansionChange,
        withHeaderBorder,
        ...otherProps
    } = props;

    const [
        expanded,
        {
            setValue: setExpanded,
            toggle: toggleExpanded,
        },
    ] = useBooleanState(!!initiallyExpanded);

    useEffect(() => {
        if (onExpansionChange) {
            onExpansionChange(expanded);
        }
    }, [expanded, onExpansionChange]);

    useEffect(() => {
        if (componentRef) {
            componentRef.current = {
                setIsExpanded: setExpanded,
            };
        }
    }, [componentRef, setExpanded]);

    return (
        <Container
            {...otherProps} // eslint-disable-line react/jsx-props-no-spreading
            className={_cs(styles.expandableContainer, className)}
            headerClassName={_cs(styles.header, headerClassName)}
            childrenContainerClassName={_cs(styles.content, childrenContainerClassName)}
            withInternalPadding
            withHeaderBorder={withHeaderBorder && expanded}
            actions={(
                <>
                    {actions}
                    <Button
                        variant="tertiary"
                        name={undefined}
                        onClick={toggleExpanded}
                    >
                        {expanded ? (
                            <ChevronUpLineIcon className={styles.icon} />
                        ) : (
                            <ChevronDownLineIcon className={styles.icon} />
                        )}
                    </Button>
                </>
            )}
            actionsContainerClassName={styles.actionsContainer}
        >
            {expanded && children}
        </Container>
    );
}

export default ExpandableContainer;
