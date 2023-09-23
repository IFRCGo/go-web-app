import BlockLoading from '#components/BlockLoading';
import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import { type RiskApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PdcResponse = RiskApiResponse<'/api/v1/pdc/'>;
type PdcEventItem = NonNullable<PdcResponse['results']>[number];
type PdcExposure = RiskApiResponse<'/api/v1/pdc/{id}/exposure/'>;

interface Props {
    data: PdcEventItem;
    exposure: PdcExposure | undefined;
    pending: boolean;
}

function EventDetails(props: Props) {
    const {
        data: {
            hazard_name,
            start_date,
            pdc_created_at,
            pdc_updated_at,
            description,
        },
        exposure,
        pending,
    } = props;

    const strings = useTranslation(i18n);

    interface Exposure {
        value?: number | null;
    }

    // NOTE: these are stored as json so we don't have typings for these
    const popExposure = exposure?.population_exposure as {
        total?: Exposure | null;
        households?: Exposure | null;
        vulnerable?: Exposure | null;
    } | null;

    // NOTE: these are stored as json so we don't have typings for these
    const capitalExposure = exposure?.capital_exposure as {
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
            spacing="compact"
            headerDescriptionContainerClassName={styles.eventMeta}
            headerDescription={(
                <>
                    <TextOutput
                        label={strings.eventDetailsViewDetails}
                        value={start_date}
                        valueType="date"
                        strongValue
                    />
                    <TextOutput
                        label={strings.eventDetailsCreatedOn}
                        value={pdc_created_at}
                        valueType="date"
                        strongValue
                    />
                    <TextOutput
                        label={strings.eventDetailsUpdatedOn}
                        value={pdc_updated_at}
                        valueType="date"
                        strongValue
                    />
                </>
            )}
        >
            {pending && <BlockLoading />}
            {!pending && (
                <>
                    <div className={styles.exposureDetails}>
                        <TextOutput
                            label={strings.eventDetailsPeopleExposed}
                            value={popExposure?.total?.value}
                            valueType="number"
                            maximumFractionDigits={0}
                            strongValue
                        />
                        <TextOutput
                            label={strings.eventDetailsHouseholdExposed}
                            value={popExposure?.households?.value}
                            valueType="number"
                            maximumFractionDigits={0}
                            strongValue
                        />
                        <TextOutput
                            label={strings.eventDetailsPeopleGroups}
                            value={popExposure?.vulnerable?.value}
                            valueType="number"
                            maximumFractionDigits={0}
                            strongValue
                        />
                        <TextOutput
                            label={strings.eventDetailsValueExposed}
                            value={capitalExposure?.total?.value}
                            valueType="number"
                            maximumFractionDigits={0}
                            compact
                            strongValue
                        />
                        <TextOutput
                            label={strings.eventDetailsSchoolExposed}
                            value={capitalExposure?.school?.value}
                            valueType="number"
                            maximumFractionDigits={0}
                            strongValue
                        />
                        <TextOutput
                            label={strings.eventHospitalsExposed}
                            value={capitalExposure?.hospital?.value}
                            valueType="number"
                            maximumFractionDigits={0}
                            strongValue
                        />
                    </div>
                    <div className={styles.description}>
                        {description}
                    </div>
                </>
            )}
        </Container>
    );
}

export default EventDetails;
