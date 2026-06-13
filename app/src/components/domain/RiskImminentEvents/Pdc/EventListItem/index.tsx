import { DataDisplay } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import ImminentEventListItem from '#components/domain/ImminentEventListItem';
import { type RiskEventListItemProps } from '#components/domain/RiskImminentEventMap';
import { type RiskApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

type ImminentEventResponse = RiskApiResponse<'/api/v1/pdc/'>;
type EventItem = NonNullable<ImminentEventResponse['results']>[number];

type Props = RiskEventListItemProps<EventItem>;

function EventListItem(props: Props) {
    const {
        data: {
            id,
            hazard_name,
            start_date,
        },
        expanded,
        onExpandClick,
        className,
        children,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <ImminentEventListItem
            className={className}
            heading={hazard_name ?? '--'}
            description={(
                <DataDisplay
                    label={strings.eventListStartedOn}
                    value={start_date}
                    valueType="date"
                />
            )}
            expanded={expanded}
            eventId={id}
            onExpandClick={onExpandClick}
        >
            {children}
        </ImminentEventListItem>
    );
}

export default EventListItem;
