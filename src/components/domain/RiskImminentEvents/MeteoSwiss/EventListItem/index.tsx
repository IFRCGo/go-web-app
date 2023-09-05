import { ChevronRightLineIcon } from '@ifrc-go/icons';

import Button from '#components/Button';
import Header from '#components/Header';
import TextOutput from '#components/TextOutput';
import { type RiskApiResponse } from '#utils/restRequest';

import styles from './styles.module.css';

type ImminentEventResponse = RiskApiResponse<'/api/v1/meteoswiss/'>;
type EventItem = NonNullable<ImminentEventResponse['results']>[number];

interface Props {
    data: EventItem;
    onExpandClick: (eventId: string | number) => void;
}

function EventListItem(props: Props) {
    const {
        data: {
            id,
            hazard_name,
            start_date,
        },
        onExpandClick,
    } = props;

    return (
        <Header
            className={styles.eventListItem}
            heading={hazard_name}
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
                label="Started on"
                value={start_date}
                valueType="date"
            />
        </Header>
    );
}

export default EventListItem;
