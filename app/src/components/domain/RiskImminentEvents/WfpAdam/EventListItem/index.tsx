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
    Header,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { _cs } from '@togglecorp/fujs';

import { type RiskEventListItemProps } from '#components/domain/RiskImminentEventMap';
import { type RiskApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type ImminentEventResponse = RiskApiResponse<'/api/v1/adam-exposure/'>;
type EventItem = NonNullable<ImminentEventResponse['results']>[number];

type Props = RiskEventListItemProps<EventItem>;

function EventListItem(props: Props) {
    const {
        data: {
            id,
            publish_date,
            title,
        },
        expanded,
        onExpandClick,
        className,
        children,
    } = props;

    const strings = useTranslation(i18n);

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
        <>
            <Header
                elementRef={elementRef}
                className={_cs(styles.eventListItem, className)}
                heading={title ?? '--'}
                headingLevel={5}
                actions={(
                    <Button
                        name={id}
                        onClick={onExpandClick}
                        variant="tertiary"
                        title={strings.wfpEventListViewDetails}
                    >
                        {expanded
                            ? <ChevronUpLineIcon className={styles.icon} />
                            : <ChevronDownLineIcon className={styles.icon} />}
                    </Button>
                )}
                spacing="cozy"
            >
                <TextOutput
                    label={strings.wfpEventListPublishedOn}
                    value={publish_date}
                    valueType="date"
                />
            </Header>
            {children}
        </>
    );
}

export default EventListItem;
