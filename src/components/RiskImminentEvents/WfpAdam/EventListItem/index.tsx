import { ChevronRightLineIcon } from '@ifrc-go/icons';

import Button from '#components/Button';
import Header from '#components/Header';
import TextOutput from '#components/TextOutput';
import type { paths } from '#generated/riskTypes';

import styles from './styles.module.css';

type GetImminentEvents = paths['/api/v1/adam-exposure/']['get'];
type ImminentEventResponse = GetImminentEvents['responses']['200']['content']['application/json'];
type EventItem = NonNullable<ImminentEventResponse['results']>[number];

interface Props {
    data: EventItem;
    onExpandClick: (eventId: string | number) => void;
}

function EventListItem(props: Props) {
    const {
        data: {
            id,
            publish_date,
            title,
        },
        onExpandClick,
    } = props;

    return (
        <Header
            className={styles.eventListItem}
            heading={title}
            headingLevel={5}
            actions={(
                <Button
                    name={id}
                    onClick={onExpandClick}
                    variant="tertiary"
                    // FIXME: use translation
                    title="View Details"
                >
                    <ChevronRightLineIcon className={styles.icon} />
                </Button>
            )}
            spacing="compact"
        >
            <TextOutput
                // FIXME: use translation
                label="Published on"
                value={publish_date}
                valueType="date"
            />
        </Header>
    );
}

export default EventListItem;
