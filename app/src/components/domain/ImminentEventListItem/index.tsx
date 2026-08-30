import {
    useEffect,
    useRef,
} from 'react';
import {
    ChevronDownLineIcon,
    ChevronUpLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
} from '@ifrc-go/ui';

interface Props {
    className?: string;
    eventId: number | string;
    heading: React.ReactNode;
    description: React.ReactNode;
    expanded: boolean;
    onExpandClick: (eventId: number | string) => void;
    children?: React.ReactNode;
}

function ImminentEventListItem(props: Props) {
    const {
        eventId,
        className,
        heading,
        description,
        expanded,
        onExpandClick,
        children,
    } = props;

    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(
        () => {
            if (expanded && elementRef.current) {
                const y = window.scrollY;
                const x = window.scrollX;
                elementRef.current.scrollIntoView({
                    behavior: 'instant',
                    block: 'start',
                });
                // NOTE: We need to scroll back because scrollIntoView also
                // scrolls the parent container
                window.scroll(x, y);
            }
        },
        [expanded],
    );

    return (
        <Container
            elementRef={elementRef}
            className={className}
            heading={heading ?? '--'}
            headingLevel={5}
            headerActions={(
                <Button
                    name={eventId}
                    onClick={onExpandClick}
                    styleVariant="action"
                    // FIXME: use strings
                    title={expanded ? 'Hide details' : 'Show details'}
                >
                    {expanded
                        ? <ChevronUpLineIcon />
                        : <ChevronDownLineIcon />}
                </Button>
            )}
            headerDescription={description}
            spacing="sm"
            withDarkBackground
            withPadding
            withoutSpacingOpticalCorrection
            withContentWell
        >
            {children}
        </Container>
    );
}

export default ImminentEventListItem;
