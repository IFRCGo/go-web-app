import { Fragment } from 'react';
import {
    Outlet,
    useParams,
} from 'react-router-dom';
import {
    Breadcrumbs,
    DateOutput,
    Description,
    ListView,
    NavigationTabList,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import NavigationTab from '#components/NavigationTab';
import Page from '#components/Page';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { getUserName } from '#utils/domain/user';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { fieldReportId } = useParams<{ fieldReportId: string }>();

    const {
        api_region_name,
    } = useGlobalEnums();

    const regionNameMap = listToMap(
        api_region_name,
        (option) => option.key,
        (option) => option.value,
    );

    const {
        pending: fetchingFieldReport,
        response: fieldReportResponse,
        error: fieldReportResponseError,
    } = useRequest({
        skip: isNotDefined(fieldReportId),
        url: '/api/v2/field-report/{id}/',
        pathVariables: {
            id: Number(fieldReportId),
        },
    });

    // ALWAYS

    const disasterType = fieldReportResponse?.dtype_details?.name;
    const countries = fieldReportResponse?.countries_details;
    const districts = fieldReportResponse?.districts_details;
    const eventDetails = fieldReportResponse?.event_details;
    const summary = fieldReportResponse?.summary;

    // NOTE: Not coming from form
    const regions = fieldReportResponse?.regions_details;

    const user = getUserName(fieldReportResponse?.user_details);

    const lastTouchedAt = fieldReportResponse?.updated_at ?? fieldReportResponse?.created_at;

    const shouldHideDetails = fetchingFieldReport
        || isDefined(fieldReportResponseError);

    return (
        <Page
            title={strings.fieldReportTitle}
            heading={shouldHideDetails ? strings.fieldReportDefaultHeading : summary}
            breadCrumbs={(
                <Breadcrumbs>
                    <Link
                        to="home"
                    >
                        {strings.home}
                    </Link>
                    <Link
                        to="emergencies"
                    >
                        {strings.emergencies}
                    </Link>
                    <Link
                        to="fieldReportDetails"
                        urlParams={{ fieldReportId }}
                    >
                        {fieldReportResponse?.summary}
                    </Link>
                </Breadcrumbs>
            )}
            actions={(
                <Link
                    to="fieldReportFormEdit"
                    urlParams={{ fieldReportId }}
                    colorVariant="primary"
                    styleVariant="outline"
                    disabled={shouldHideDetails}
                >
                    {strings.editReportButtonLabel}
                </Link>
            )}
            description={!shouldHideDetails && (
                <ListView layout="block">
                    <ListView
                        withWrap
                        withSpacingOpticalCorrection
                        spacing="sm"
                    >
                        <span>
                            {disasterType}
                        </span>
                        <span>
                            /
                        </span>
                        <span>
                            {countries?.map((country, index) => (
                                <Fragment key={country.id}>
                                    <Link
                                        to="countriesLayout"
                                        urlParams={{ countryId: country.id }}
                                    >
                                        {country.name}
                                    </Link>
                                    {index !== countries.length - 1 ? ', ' : null}
                                </Fragment>
                            ))}
                        </span>
                        {eventDetails && (
                            <>
                                <span>
                                    /
                                </span>
                                <Link
                                    to="emergenciesLayout"
                                    urlParams={{ emergencyId: eventDetails.id }}
                                >
                                    {eventDetails.name}
                                </Link>
                            </>
                        )}
                    </ListView>
                    <Description withLightText>
                        {resolveToComponent(strings.lastUpdatedByLabel, {
                            user: user || '--',
                            date: (
                                <DateOutput
                                    value={lastTouchedAt}
                                />
                            ),
                            region: regions
                                ?.map((region) => (
                                    isDefined(region.name)
                                        ? regionNameMap?.[region.name]
                                        : undefined
                                ))
                                .filter(isDefined)
                                .join(', ') || '--',
                            district: districts
                                ?.map((district) => district.name)
                                .join(', ') || '--',
                        })}
                    </Description>
                </ListView>
            )}
            contentOriginalLanguage={fieldReportResponse?.translation_module_original_language}
        >
            <NavigationTabList>
                <NavigationTab
                    to="fieldReportEmergencyOverview"
                    urlParams={{ fieldReportId }}
                >
                    {strings.emergencyOverview}
                </NavigationTab>
                <NavigationTab
                    to="fieldReportActionsSummary"
                    urlParams={{ fieldReportId }}
                >
                    {strings.emergencyActionsSummary}
                </NavigationTab>
                <NavigationTab
                    to="fieldReportBackground"
                    urlParams={{ fieldReportId }}
                >
                    {strings.emergencyBackground}
                </NavigationTab>
            </NavigationTabList>
            <Outlet />
        </Page>
    );
}

Component.displayName = 'FieldReportDetails';
