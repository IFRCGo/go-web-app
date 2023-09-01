import BlockLoading from '#components/BlockLoading';
import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import { type RiskApiResponse } from '#utils/restRequest';

import styles from './styles.module.css';

type MeteoSwissResponse = RiskApiResponse<'/api/v1/meteoswiss/'>;
type MeteoSwissItem = NonNullable<MeteoSwissResponse['results']>[number];
type MeteoSwissExposure = RiskApiResponse<'/api/v1/meteoswiss/{id}/exposure/'>;

interface Props {
    data: MeteoSwissItem;
    exposure: MeteoSwissExposure | undefined;
    pending: boolean;
}

function EventDetails(props: Props) {
    const {
        data: {
            // id,
            hazard_name,
            start_date,
        },
        pending,
        exposure,
    } = props;

    // eslint-disable-next-line no-console
    console.info(exposure);

    // TODO: add exposure details
    return (
        <Container
            className={styles.eventDetails}
            childrenContainerClassName={styles.content}
            heading={hazard_name}
            headingLevel={4}
            spacing="compact"
            headerDescription={(
                <TextOutput
                    // FIXME: use translation
                    label="Started on"
                    value={start_date}
                    valueType="date"
                    strongValue
                />
            )}
        >
            {pending && <BlockLoading />}
        </Container>
    );
}

export default EventDetails;
