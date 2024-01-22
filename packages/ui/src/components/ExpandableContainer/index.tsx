import { useEffect } from 'react';
import {
    ChevronDownLineIcon,
    ChevronUpLineIcon,
} from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import Button from '#components/Button';
import useBooleanState from '#hooks/useBooleanState';
import useTranslation from '#hooks/useTranslation';

import Container, { Props as ContainerProps } from '../Container';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props extends Omit<ContainerProps, 'withInternalPadding' | 'withoutWrapInHeading'> {
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

    const strings = useTranslation(i18n);

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
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={_cs(styles.expandableContainer, className)}
            headerClassName={_cs(styles.header, headerClassName)}
            childrenContainerClassName={_cs(styles.content, childrenContainerClassName)}
            withInternalPadding
            withHeaderBorder={withHeaderBorder && expanded}
            withoutWrapInHeading
            actions={(
                <>
                    {actions}
                    <Button
                        variant="tertiary"
                        name={undefined}
                        onClick={toggleExpanded}
                        title={expanded
                            ? strings.expandableContainerCollapse
                            : strings.expandableContainerExpand}
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
            footerActions={expanded && (
                <Button
                    variant="tertiary"
                    name={undefined}
                    onClick={toggleExpanded}
                    title={expanded
                        ? strings.expandableContainerCollapse
                        : strings.expandableContainerExpand}
                >
                    {expanded ? (
                        <ChevronUpLineIcon className={styles.icon} />
                    ) : (
                        <ChevronDownLineIcon className={styles.icon} />
                    )}
                </Button>
            )}
        >
            {expanded && children}
        </Container>
    );
}

export default ExpandableContainer;
