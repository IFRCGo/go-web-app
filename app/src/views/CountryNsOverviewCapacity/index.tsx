import { useOutletContext } from 'react-router-dom';
import {
    Container,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    formatDate,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import TabPage from '#components/TabPage';
import { type CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import CountryNsCapacityStrengthening from './CountryNsCapacityStrengthening';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId } = useOutletContext<CountryOutletContext>();

    const strings = useTranslation(i18n);

    const {
        pending: countryPerProcessStatusPending,
        response: countryPerProcessStatusResponse,
    } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/public-per-process-status/',
        query: {
            country: isDefined(countryId) ? [Number(countryId)] : undefined,
            limit: 9999,
        },
    });

    const hasPer = isDefined(countryPerProcessStatusResponse)
        && isDefined(countryPerProcessStatusResponse.results)
        && countryPerProcessStatusResponse.results.length > 0;

    return (
        <TabPage
            wikiLinkPathName="user_guide/Country_Pages#capacity"
        >
            <Container
                headerActions={(
                    <Link
                        href="https://www.ifrc.org/evaluations/"
                        external
                        withLinkIcon
                        colorVariant="primary"
                        styleVariant="outline"
                    >
                        {strings.nsOverviewCapacityLink}
                    </Link>
                )}
                headerDescription={strings.nSOverviewCapacityDescription}
                withCenteredHeaderDescription
                spacing="xl"
            >
                {null}
            </Container>
            {/* Data is currently under review, it will be include in the next version */}
            {/* Hide this section */}
            {/* {countryResponse?.region === REGION_ASIA && (
                <CountryNsOrganisationalCapacity />
            )} */}
            <CountryNsCapacityStrengthening />
            <Container
                heading={strings.nsPreparednessHeading}
                headerDescription={strings.nsPreparednessDescription}
                withHeaderBorder
                pending={countryPerProcessStatusPending}
                headerActions={(
                    <Link
                        to="newPerOverviewForm"
                        colorVariant="primary"
                        styleVariant="filled"
                    >
                        {strings.perStartPerProcess}
                    </Link>
                )}
                footerActions={(
                    <TextOutput
                        label={strings.moreDetails}
                        value={(
                            <Link
                                styleVariant="action"
                                to="preparednessLayout"
                                withUnderline
                                withLinkIcon
                            >
                                {strings.perGlobalSummary}
                            </Link>
                        )}
                    />
                )}
                empty={!hasPer}
            >
                <ListView
                    layout="grid"
                    numPreferredGridColumns={3}
                    minGridColumnSize="20rem"
                >
                    {countryPerProcessStatusResponse?.results?.map(
                        (perProcess) => (
                            <Container
                                key={perProcess.id}
                                heading={resolveToString(
                                    strings.perCycleHeading,
                                    {
                                        cycle: perProcess.assessment_number,
                                        countryName: perProcess.country_details.name,
                                    },
                                )}
                                headingLevel={4}
                                headerDescription={resolveToString(
                                    strings.perCycleHeadingDescription,
                                    { updatedDate: formatDate(perProcess.updated_at) },
                                )}
                                withHeaderBorder
                                headerActions={(
                                    <Link
                                        to="countryPreparedness"
                                        urlParams={{
                                            countryId,
                                            perId: perProcess.id,
                                        }}
                                        styleVariant="outline"
                                        colorVariant="primary"
                                    >
                                        {strings.perViewLink}
                                    </Link>
                                )}
                                footer={(
                                    <ListView
                                        layout="block"
                                        withSpacingOpticalCorrection
                                        spacing="sm"
                                    >
                                        <TextOutput
                                            label={strings.perTypeOfAssessmentLabel}
                                            value={perProcess.type_of_assessment_details?.name}
                                        />
                                        <TextOutput
                                            label={strings.perFocalPointLabel}
                                            value={[perProcess.ns_focal_point_name, perProcess.ns_focal_point_email].filter(isTruthyString).join(', ')}
                                        />
                                    </ListView>
                                )}
                                withFooterBorder
                                withPadding
                                withBackground
                                withShadow
                            >
                                <ListView
                                    layout="grid"
                                    minGridColumnSize="6rem"
                                >
                                    <TextOutput
                                        value={perProcess.phase_display}
                                        description={strings.perPhaseLabel}
                                        withBlockLayout
                                        strongValue
                                    />
                                    <TextOutput
                                        value={perProcess.date_of_assessment}
                                        description={strings.perAssessmentDateLabel}
                                        withBlockLayout
                                        strongValue
                                    />
                                </ListView>
                            </Container>
                        ),
                    )}
                </ListView>
            </Container>
        </TabPage>
    );
}

Component.displayName = 'CountryNsOverviewCapacity';
