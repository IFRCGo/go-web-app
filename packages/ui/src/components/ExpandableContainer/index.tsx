import {
    useEffect,
    useMemo,
} from 'react';
import {
    ChevronDownLineIcon,
    ChevronUpLineIcon,
} from '@ifrc-go/icons';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import Button from '#components/Button';
import Container, { Props as ContainerProps } from '#components/Container';
import useBooleanState from '#hooks/useBooleanState';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props extends ContainerProps {
    initiallyExpanded?: boolean;
    onExpansionChange?: (isExpanded: boolean) => void;
    /** Imperative handle to control the expansion state from outside */
    componentRef?: React.RefObject<{
        setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    } | null>;
    /** [expandLabel, collapseLabel] for the toggle button */
    toggleButtonLabel?: [React.ReactNode, React.ReactNode];
    withToggleButtonOnFooter?: boolean;
}

/**
 * Container whose children can be collapsed/expanded with a toggle
 * button in the header or footer (specific layer).
 */
function ExpandableContainer(props: Props) {
    const {
        className,
        children,
        headerActions,
        initiallyExpanded = false,
        componentRef,
        onExpansionChange,
        withHeaderBorder,
        withToggleButtonOnFooter,
        toggleButtonLabel,
        footerActions,
        ...otherProps
    } = props;

    // const containerRef = useRef<HTMLDivElement>(null);
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

    /*
    const handleExpansionToggle = useCallback(() => {
        toggleExpanded();
        if (containerRef) {
            containerRef.current?.scrollIntoView();
        }
    }, [toggleExpanded]);
    */

    const [
        expandLabel = <ChevronDownLineIcon className={styles.icon} />,
        collapseLabel = <ChevronUpLineIcon className={styles.icon} />,
    ] = toggleButtonLabel ?? [];

    const hasToggleButtonLabel = isDefined(toggleButtonLabel);

    const icon = useMemo(() => {
        if (!hasToggleButtonLabel) {
            return undefined;
        }

        if (expanded) {
            return <ChevronUpLineIcon className={styles.icon} />;
        }

        return <ChevronDownLineIcon className={styles.icon} />;
    }, [hasToggleButtonLabel, expanded]);

    const toggleButton = useMemo(() => (
        <Button
            variant="tertiary"
            name={undefined}
            onClick={toggleExpanded}
            title={expanded
                ? strings.expandableContainerCollapse
                : strings.expandableContainerExpand}
            after={icon}
        >
            {expanded ? collapseLabel : expandLabel}
        </Button>
    ), [
        toggleExpanded,
        expanded,
        strings.expandableContainerCollapse,
        strings.expandableContainerExpand,
        icon,
        collapseLabel,
        expandLabel,
    ]);

    return (
        <Container
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            // elementRef={containerRef}
            className={_cs(styles.expandableContainer, className)}
            withHeaderBorder={withHeaderBorder && expanded}
            withoutWrapInHeader={!withToggleButtonOnFooter}
            headerActions={(
                <>
                    {headerActions}
                    {!withToggleButtonOnFooter && toggleButton}
                </>
            )}
            footerActions={(isDefined(footerActions) || withToggleButtonOnFooter) && (
                <>
                    {footerActions}
                    {withToggleButtonOnFooter && toggleButton}
                </>
            )}
        >
            {(expanded) && children}
        </Container>
    );
}

export default ExpandableContainer;
