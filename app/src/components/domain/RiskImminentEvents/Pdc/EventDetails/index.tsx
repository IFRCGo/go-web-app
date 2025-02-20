import {
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import { type RiskEventDetailProps } from '#components/domain/RiskImminentEventMap';
import { type RiskApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

type PdcResponse = RiskApiResponse<'/api/v1/pdc/'>;
type PdcEventItem = NonNullable<PdcResponse['results']>[number];
type PdcExposure = RiskApiResponse<'/api/v1/pdc/{id}/exposure/'>;

type Props = RiskEventDetailProps<PdcEventItem, PdcExposure | undefined>;

function EventDetails(props: Props) {
    const {
        data: {
            pdc_created_at,
            pdc_updated_at,
            description,
        },
        exposure,
        pending,
        children,
    } = props;

    const strings = useTranslation(i18n);

    interface Exposure {
        value?: number | null;
        valueFormatted?: string | null;
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
            contentViewType="vertical"
            spacing="cozy"
            withBorderAndHeaderBackground
            pending={pending}
        >
            <Container
                contentViewType="vertical"
                spacing="compact"
            >
                <TextOutput
                    label={strings.eventDetailsCreatedOn}
                    value={pdc_created_at}
                    valueType="date"
                    strongValue
                    withBackground
                />
                <TextOutput
                    label={strings.eventDetailsUpdatedOn}
                    value={pdc_updated_at}
                    valueType="date"
                    strongValue
                    withBackground
                />
                <TextOutput
                    label={strings.eventDetailsPeopleExposed}
                    value={popExposure?.total?.valueFormatted}
                    strongValue
                    withBackground
                />
                <TextOutput
                    label={strings.eventDetailsHouseholdExposed}
                    value={popExposure?.households?.valueFormatted}
                    strongValue
                    withBackground
                />
                <TextOutput
                    label={strings.eventDetailsPeopleGroups}
                    value={popExposure?.vulnerable?.valueFormatted}
                    strongValue
                    withBackground
                />
                <TextOutput
                    label={strings.eventDetailsValueExposed}
                    value={capitalExposure?.total?.valueFormatted}
                    strongValue
                    withBackground
                />
                <TextOutput
                    label={strings.eventDetailsSchoolExposed}
                    value={capitalExposure?.school?.valueFormatted}
                    strongValue
                    withBackground
                />
                <TextOutput
                    label={strings.eventHospitalsExposed}
                    value={capitalExposure?.hospital?.valueFormatted}
                    strongValue
                    withBackground
                />
            </Container>
            <TextOutput
                valueType="text"
                value={description}
                withBackground
            />
            {children}
        </Container>
    );
}

export default EventDetails;
