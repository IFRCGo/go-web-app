import { DataDisplay } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import ImminentEventListItem from '#components/domain/ImminentEventListItem';
import { type RiskEventListItemProps } from '#components/domain/RiskImminentEventMap';
import { type RiskApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

type ImminentEventResponse = RiskApiResponse<'/api/v1/gdacs/'>;
type GdacsItem = NonNullable<ImminentEventResponse['results']>[number];

type Props = RiskEventListItemProps<GdacsItem>;

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
            eventId={id}
            expanded={expanded}
            onExpandClick={onExpandClick}
            heading={hazard_name ?? '--'}
            description={(
                <DataDisplay
                    label={strings.gdacsEventStartedOn}
                    value={start_date}
                    valueType="date"
                    textSize="sm"
                />
            )}
        >
            {children}
        </ImminentEventListItem>
    );
}

export default EventListItem;
