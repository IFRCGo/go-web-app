import {
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import ImminentEventListItem from '#components/domain/ImminentEventListItem';
import { type RiskEventListItemProps } from '#components/domain/RiskImminentEventMap';

import Tag from '../../Tag';
import { roundImpact } from '../../utils';
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
            heading={(
                <ListView spacing="xs">
                    {data.name}
                    {data.observation.cellTrigger && (
                        <Tag
                            label={strings.arcEventListTriggered}
                            colorVariant="primary"
                        />
                    )}
                </ListView>
            )}
            description={!expanded && (
                <TextOutput
                    label={strings.arcEventListPopulationImpacted}
                    value={roundImpact(data.observation.impact)}
                    valueType="number"
                    compact
                    maximumFractionDigits={1}
                    textSize="sm"
                />
            )}
        >
            {children}
        </ImminentEventListItem>
    );
}

export default EventListItem;
