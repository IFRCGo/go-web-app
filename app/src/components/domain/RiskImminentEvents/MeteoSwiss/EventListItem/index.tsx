import {
    useEffect,
    useRef,
} from 'react';
import { DataDisplay } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import ImminentEventListItem from '#components/domain/ImminentEventListItem';
import { type RiskEventListItemProps } from '#components/domain/RiskImminentEventMap';
import { type RiskApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

type ImminentEventResponse = RiskApiResponse<'/api/v1/meteoswiss/'>;
type EventItem = NonNullable<ImminentEventResponse['results']>[number];

type Props = RiskEventListItemProps<EventItem>;

function EventListItem(props: Props) {
    const {
        data: {
            id,
            hazard_type_display,
            country_details,
            start_date,
            hazard_name,
        },
        expanded,
        onExpandClick,
        className,
        children,
    } = props;

    const strings = useTranslation(i18n);

    const hazardName = `${hazard_type_display} - ${country_details?.name ?? hazard_name}`;

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
        <ImminentEventListItem
            className={className}
            eventId={id}
            expanded={expanded}
            onExpandClick={onExpandClick}
            heading={hazardName}
            description={(
                <DataDisplay
                    label={strings.meteoSwissEventListStartedOn}
                    value={start_date}
                    valueType="date"
                />
            )}
        >
            {children}
        </ImminentEventListItem>
    );
}

export default EventListItem;
