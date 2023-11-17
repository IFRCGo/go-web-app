import { ChevronRightLineIcon } from '@ifrc-go/icons';

import Button from '#components/Button';
import Header from '#components/Header';
import TextOutput from '#components/TextOutput';
import { type RiskApiResponse } from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

type ImminentEventResponse = RiskApiResponse<'/api/v1/pdc/'>;
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

    const strings = useTranslation(i18n);

    return (
        <Header
            className={styles.eventListItem}
            heading={hazard_name ?? '--'}
            headingLevel={5}
            actions={(
                <Button
                    name={id}
                    onClick={onExpandClick}
                    variant="tertiary"
                    title={strings.eventListViewDetails}
                >
                    <ChevronRightLineIcon className={styles.icon} />
                </Button>
            )}
            spacing="condensed"
        >
            <TextOutput
                label={strings.eventListStartedOn}
                value={start_date}
                valueType="date"
            />
        </Header>
    );
}

export default EventListItem;
