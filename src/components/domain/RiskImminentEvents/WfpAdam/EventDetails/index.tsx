import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import type { paths } from '#generated/riskTypes';
// import { useRiskRequest } from '#utils/restRequest';

import styles from './styles.module.css';

type GetImminentEvents = paths['/api/v1/adam-exposure/']['get'];
type ImminentEventResponse = GetImminentEvents['responses']['200']['content']['application/json'];
type EventItem = NonNullable<ImminentEventResponse['results']>[number];

interface Props {
    data: EventItem;
    icons?: React.ReactNode;
    actions?: React.ReactNode;
}

function EventDetails(props: Props) {
    const {
        data: {
            // id,
            title,
            publish_date,
        },
        icons,
        actions,
    } = props;

    /*
    const { response: exposureResponse } = useRiskRequest({
        apiType: 'risk',
        url: '/api/v1/adam-exposure/{id}/',
        pathVariables: { id },
    });
     */

    // TODO: add exposure details
    return (
        <Container
            className={styles.eventDetails}
            childrenContainerClassName={styles.content}
            heading={title}
            headingLevel={4}
            icons={icons}
            actions={actions}
        >
            <div className={styles.eventMeta}>
                <TextOutput
                    // FIXME: use translation
                    label="Published on"
                    value={publish_date}
                    valueType="date"
                    strongValue
                />
            </div>
        </Container>
    );
}

export default EventDetails;
