import { ChevronRightLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Header,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { _cs } from '@togglecorp/fujs';

import { RiskEventListItemProps } from '#components/domain/RiskImminentEventMap';
import { type RiskApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type ImminentEventResponse = RiskApiResponse<'/api/v1/adam-exposure/'>;
type EventItem = NonNullable<ImminentEventResponse['results']>[number];

type Props = RiskEventListItemProps<EventItem>;

function EventListItem(props: Props) {
    const {
        data: {
            id,
            publish_date,
            title,
        },
        onExpandClick,
        className,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <Header
            className={_cs(styles.eventListItem, className)}
            heading={title ?? '--'}
            headingLevel={5}
            actions={(
                <Button
                    name={id}
                    onClick={onExpandClick}
                    variant="tertiary"
                    title={strings.wfpEventListViewDetails}
                >
                    <ChevronRightLineIcon className={styles.icon} />
                </Button>
            )}
            spacing="cozy"
        >
            <TextOutput
                label={strings.wfpEventListPublishedOn}
                value={publish_date}
                valueType="date"
            />
        </Header>
    );
}

export default EventListItem;
