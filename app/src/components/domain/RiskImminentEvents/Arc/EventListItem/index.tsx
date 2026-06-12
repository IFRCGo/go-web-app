import {
    ButtonLayout,
    TextOutput,
} from '@ifrc-go/ui';

import ImminentEventListItem from '#components/domain/ImminentEventListItem';
import { type RiskEventListItemProps } from '#components/domain/RiskImminentEventMap';

import { type ArcEvent } from '../index';

import styles from './styles.module.css';

type Props = RiskEventListItemProps<ArcEvent>;

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
            heading={(
                <div className={styles.heading}>
                    {data.adminAreaName}
                    {data.cellTrigger && (
                        <ButtonLayout
                            // FIXME: use strings
                            className={styles.triggerBadge}
                            colorVariant="primary"
                            spacingOffset={-3}
                            withAdditionalInlinePadding={false}
                        >
                            Cell trigger
                        </ButtonLayout>
                    )}
                </div>
            )}
            description={(
                <TextOutput
                    // FIXME: use strings
                    label="Impact"
                    value={data.impact}
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
