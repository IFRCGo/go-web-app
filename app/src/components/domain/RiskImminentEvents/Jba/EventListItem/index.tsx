import { TextOutput } from '@ifrc-go/ui';

import ImminentEventListItem from '#components/domain/ImminentEventListItem';
import { type RiskEventListItemProps } from '#components/domain/RiskImminentEventMap';

import { type JbaEvent } from '../index';

type Props = RiskEventListItemProps<JbaEvent>;

function EventListItem(props: Props) {
    const {
        data,
        expanded,
        onExpandClick,
        className,
        children,
    } = props;

    return (
        <ImminentEventListItem
            className={className}
            eventId={data.id}
            expanded={expanded}
            onExpandClick={onExpandClick}
            heading={data.adminAreaName}
            description={(
                <TextOutput
                    // FIXME: use strings
                    label="Forecast impact (mean)"
                    value={data.band5Mean}
                    valueType="number"
                    maximumFractionDigits={3}
                    textSize="sm"
                />
            )}
        >
            {children}
        </ImminentEventListItem>
    );
}

export default EventListItem;
