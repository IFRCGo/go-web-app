import { TextOutput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import ImminentEventListItem from '#components/domain/ImminentEventListItem';
import { type RiskEventListItemProps } from '#components/domain/RiskImminentEventMap';

import {
    impactSelector,
    type JbaDistrictEvent,
} from '../utils';

import i18n from './i18n.json';

type Props = RiskEventListItemProps<JbaDistrictEvent>;

function EventListItem(props: Props) {
    const {
        data,
        expanded,
        onExpandClick,
        className,
        children,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <ImminentEventListItem
            className={className}
            eventId={data.id}
            expanded={expanded}
            onExpandClick={onExpandClick}
            heading={data.name}
            description={!expanded && (
                <TextOutput
                    label={strings.jbaEventListPopulationImpacted}
                    value={impactSelector(data.activeRow)}
                    valueType="number"
                    compact
                    maximumFractionDigits={0}
                    textSize="sm"
                />
            )}
        >
            {children}
        </ImminentEventListItem>
    );
}

export default EventListItem;
