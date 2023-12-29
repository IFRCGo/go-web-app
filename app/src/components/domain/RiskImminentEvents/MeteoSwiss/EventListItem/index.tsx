import { ChevronRightLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Header,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import { type RiskApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
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
            hazard_type_display,
            country_details,
            start_date,
            hazard_name,
        },
        onExpandClick,
    } = props;

    const strings = useTranslation(i18n);

    const hazardName = `${hazard_type_display} - ${country_details?.name ?? hazard_name}`;

    return (
        <Header
            className={styles.eventListItem}
            heading={hazardName ?? '--'}
            headingLevel={5}
            actions={(
                <Button
                    name={id}
                    onClick={onExpandClick}
                    variant="tertiary"
                    title={strings.meteoSwissEventListViewDetails}
                >
                    <ChevronRightLineIcon className={styles.icon} />
                </Button>
            )}
            spacing="condensed"
        >
            <TextOutput
                label={strings.meteoSwissEventListStartedOn}
                value={start_date}
                valueType="date"
            />
        </Header>
    );
}

export default EventListItem;
