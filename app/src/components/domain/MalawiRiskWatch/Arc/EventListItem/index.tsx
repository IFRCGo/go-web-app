import {
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import ImminentEventListItem from '#components/domain/ImminentEventListItem';
import { type RiskEventListItemProps } from '#components/domain/RiskImminentEventMap';

import { type ArcDistrictEvent } from '../utils';

import i18n from './i18n.json';

type Props = RiskEventListItemProps<ArcDistrictEvent>;

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
                <ListView
                    spacing="sm"
                    withWrap
                >
                    <TextOutput
                        label={strings.arcEventListPopulationImpacted}
                        value={data.observation.impact}
                        valueType="number"
                        compact
                        maximumFractionDigits={1}
                        textSize="sm"
                    />
                    <TextOutput
                        label={strings.arcEventListTrigger}
                        value={data.observation.cellTrigger
                            ? strings.arcEventListTriggered
                            : strings.arcEventListNotTriggered}
                        textSize="sm"
                    />
                </ListView>
            )}
        >
            {children}
        </ImminentEventListItem>
    );
}

export default EventListItem;
