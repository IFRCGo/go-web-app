import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import type { paths } from '#generated/riskTypes';
import { useRiskRequest } from '#utils/restRequest';

import styles from './styles.module.css';

type GetImminentEvents = paths['/api/v1/pdc/']['get'];
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
            id,
            hazard_name,
            start_date,
            pdc_created_at,
            pdc_updated_at,
            description,
        },
        icons,
        actions,
    } = props;

    const { response: exposureResponse } = useRiskRequest({
        apiType: 'risk',
        url: '/api/v1/pdc/{id}/exposure/',
        pathVariables: { id },
    });

    interface Exposure {
        value?: number | null;
    }

    // NOTE: these are stored as json so we don't have typings for these
    const popExposure = exposureResponse?.population_exposure as {
        total?: Exposure | null;
        households?: Exposure | null;
        vulnerable?: Exposure | null;
    } | null;

    // NOTE: these are stored as json so we don't have typings for these
    const capitalExposure = exposureResponse?.capital_exposure as {
        total?: Exposure | null;
        school?: Exposure | null;
        hospital?: Exposure | null;
    } | null;

    return (
        <Container
            className={styles.eventDetails}
            childrenContainerClassName={styles.content}
            heading={hazard_name}
            headingLevel={4}
            icons={icons}
            actions={actions}
        >
            <div className={styles.eventMeta}>
                <TextOutput
                    // FIXME: use translation
                    label="Started on"
                    value={start_date}
                    valueType="date"
                    strongValue
                />
                <TextOutput
                    // FIXME: use translation
                    label="Created on"
                    value={pdc_created_at}
                    valueType="date"
                    strongValue
                />
                <TextOutput
                    // FIXME: use translation
                    label="Updated on"
                    value={pdc_updated_at}
                    valueType="date"
                    strongValue
                />
            </div>
            <div className={styles.exposureDetails}>
                <TextOutput
                    // FIXME: use translation
                    label="People exposed / Potentially affected"
                    value={popExposure?.total?.value}
                    valueType="number"
                    maximumFractionDigits={0}
                    strongValue
                />
                <TextOutput
                    // FIXME: use translation
                    label="Households exposed"
                    value={popExposure?.households?.value}
                    valueType="number"
                    maximumFractionDigits={0}
                    strongValue
                />
                <TextOutput
                    // FIXME: use translation
                    label="People in vulnerable groups exposed to the hazard"
                    value={popExposure?.vulnerable?.value}
                    valueType="number"
                    maximumFractionDigits={0}
                    strongValue
                />
                <TextOutput
                    // FIXME: use translation
                    label="Value (USD) of exposed buildings"
                    value={capitalExposure?.total?.value}
                    valueType="number"
                    maximumFractionDigits={0}
                    compact
                    strongValue
                />
                <TextOutput
                    // FIXME: use translation
                    label="Schools exposed"
                    value={capitalExposure?.school?.value}
                    valueType="number"
                    maximumFractionDigits={0}
                    strongValue
                />
                <TextOutput
                    // FIXME: use translation
                    label="Hospitals exposed"
                    value={capitalExposure?.hospital?.value}
                    valueType="number"
                    maximumFractionDigits={0}
                    strongValue
                />
            </div>
            <div className={styles.description}>
                {description}
            </div>
        </Container>
    );
}

export default EventDetails;
