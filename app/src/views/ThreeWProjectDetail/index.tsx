import {
    useCallback,
    useMemo,
} from 'react';
import { useParams } from 'react-router-dom';
import { PencilFillIcon } from '@ifrc-go/icons';
import {
    DateOutput,
    InfoPopup,
    List,
    Message,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import DetailsFailedToLoadMessage from '#components/domain/DetailsFailedToLoadMessage';
import Link from '#components/Link';
import Page from '#components/Page';
import { getUserName } from '#utils/domain/user';
import type { GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';

import DisaggregatedPeopleOutput, { type Props as DisaggregatedPeopleOutputProps } from './DisaggregatedPeopleOutput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type ProjectItem = NonNullable<GoApiResponse<'/api/v2/project/'>['results']>[number];
type AnnualSplitItem = NonNullable<ProjectItem['annual_splits']>[number];

const annualSplitKeySelector = (item: AnnualSplitItem) => item.id;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { projectId } = useParams<{ projectId: string }>();

    const {
        pending: fetchingProject,
        response: projectResponse,
        error: projectResponseError,
    } = useRequest({
        skip: isNotDefined(projectId),
        url: '/api/v2/project/{id}/',
        pathVariables: isDefined(projectId) ? {
            id: Number(projectId),
        } : undefined,
    });

    const districtList = useMemo(() => (
        projectResponse
            ?.project_districts_detail
            ?.map((district) => district?.name).join(', ')
    ), [projectResponse]);

    const annualSplitListRendererParams = useCallback(
        (
            _: number,
            data: AnnualSplitItem,
        ): DisaggregatedPeopleOutputProps => ({
            year: data.year,
            budgetAmount: data.budget_amount,
            targetMale: data.target_male,
            targetFemale: data.target_female,
            targetOther: data.target_other,
            targetTotal: data.target_total,
            reachedMale: data.reached_male,
            reachedFemale: data.reached_female,
            reachedOther: data.reached_other,
            reachedTotal: data.reached_total,
        }),
        [],
    );

    const shouldHideDetails = fetchingProject
        || isDefined(projectResponseError);

    return (
        <Page
            className={styles.threeWProjectDetail}
            title={strings.threeWDetailsTitle}
            heading={projectResponse?.name ?? strings.threeWDetailsHeading}
            actions={(
                <Link
                    variant="secondary"
                    to="threeWProjectEdit"
                    urlParams={{ projectId }}
                    icons={<PencilFillIcon />}
                    disabled={shouldHideDetails}
                >
                    {strings.editProject}
                </Link>
            )}
            description={!shouldHideDetails && (
                <TextOutput
                    valueClassName={styles.modifiedOnValue}
                    label={strings.lastModifiedOnTitle}
                    // FIXME: this should all be 1 string with templates
                    value={(
                        <>
                            {resolveToComponent(strings.lastModifiedDetail, {
                                date: (
                                    <DateOutput
                                        value={projectResponse?.modified_at}
                                    />
                                ),
                            })}
                            {projectResponse?.modified_by_detail && (
                                resolveToComponent(strings.lastModifiedDetailByUser, {
                                    user: getUserName(projectResponse?.modified_by_detail),
                                })
                            )}
                        </>
                    )}
                    strongLabel
                />
            )}
            // FIXME: typing should be fixed in server (Language instead of string)
            contentOriginalLanguage={projectResponse?.translation_module_original_language}
            mainSectionClassName={styles.content}
        >
            {fetchingProject && (
                <Message
                    pending
                />
            )}
            {isDefined(projectResponseError) && (
                <DetailsFailedToLoadMessage
                    description={projectResponseError.value.messageForNotification}
                />
            )}
            {!shouldHideDetails && (
                <>
                    <div className={styles.projectDetails}>
                        <TextOutput
                            label={strings.reportingNationalSocietyTitle}
                            value={isDefined(projectResponse?.reporting_ns_detail?.iso3) ? (
                                <Link
                                    to="countryNsOverviewActivities"
                                    urlParams={{
                                        countryId: projectResponse?.reporting_ns_detail.id,
                                    }}
                                    withUnderline
                                >
                                    {projectResponse?.reporting_ns_detail?.society_name}
                                </Link>
                            ) : (
                                projectResponse?.reporting_ns_detail?.society_name
                            )}
                            strongValue
                        />
                        <TextOutput
                            label={strings.countryAndRegionTitle}
                            value={(
                                <Link
                                    withUnderline
                                    to="countriesThreeWLayout"
                                    urlParams={{
                                        countryId: projectResponse?.project_country_detail.id,
                                    }}
                                >
                                    {projectResponse?.project_country_detail?.name}
                                </Link>
                            )}
                            description={districtList}
                            strongValue
                        />
                        {isDefined(projectResponse?.reporting_ns_contact_name) && (
                            <>
                                <TextOutput
                                    label={strings.nSContactTitle}
                                    value={[
                                        projectResponse?.reporting_ns_contact_name,
                                        projectResponse?.reporting_ns_contact_role,
                                    ].filter(isDefined).join(', ')}
                                    strongValue
                                />
                                <TextOutput
                                    label={strings.nsContactLabel}
                                    value={(
                                        <Link
                                            href={`mailto:${projectResponse?.reporting_ns_contact_email}`}
                                            external
                                        >
                                            {projectResponse?.reporting_ns_contact_email}
                                        </Link>
                                    )}
                                    strongValue
                                />
                            </>
                        )}
                        <TextOutput
                            label={strings.projectTypeLabel}
                            value={projectResponse?.operation_type_display}
                            strongValue
                        />
                        <TextOutput
                            description={(
                                <InfoPopup
                                    title={strings.projectTypeToolTipLabel}
                                    description={strings.projectTypeToolTipValue}
                                />
                            )}
                            label={strings.programmeTypeLabel}
                            value={projectResponse?.programme_type_display}
                            strongValue
                        />
                        <TextOutput
                            label={strings.linkedOperationLabel}
                            value={(
                                <Link
                                    to="emergenciesLayout"
                                    urlParams={{
                                        emergencyId: projectResponse?.event_detail?.id,
                                    }}
                                    withUnderline
                                >
                                    {projectResponse?.event_detail?.name}
                                </Link>
                            )}
                            strongValue
                        />
                        <TextOutput
                            label={strings.disasterTypeLabel}
                            value={projectResponse?.dtype_detail?.name}
                            strongValue
                        />
                        <TextOutput
                            label={strings.primarySectorLabel}
                            value={projectResponse?.primary_sector_display}
                            strongValue
                        />
                        <TextOutput
                            label={strings.tagsTitle}
                            value={projectResponse?.secondary_sectors_display?.join(', ')}
                            description={(
                                <InfoPopup
                                    title={strings.tagsTitle}
                                    description={strings.threeWTagsTooltip}
                                />
                            )}
                            strongValue
                        />
                        <TextOutput
                            label={strings.threeWStartDate}
                            value={projectResponse?.start_date}
                            valueType="date"
                            strongValue
                        />
                        <TextOutput
                            label={strings.threeWEndDate}
                            value={projectResponse?.end_date}
                            valueType="date"
                            strongValue
                        />
                        <TextOutput
                            label={strings.statusLabel}
                            value={projectResponse?.status_display}
                            strongValue
                        />
                    </div>
                    {(projectResponse?.annual_splits?.length ?? 0) > 0 ? (
                        <List
                            data={projectResponse?.annual_splits}
                            className={styles.yearlyDisaggregatedPeopleList}
                            renderer={DisaggregatedPeopleOutput}
                            rendererParams={annualSplitListRendererParams}
                            keySelector={annualSplitKeySelector}
                            pending={fetchingProject}
                            errored={false}
                            filtered={false}
                        />
                    ) : (
                        <DisaggregatedPeopleOutput
                            budgetAmount={projectResponse?.budget_amount}
                            targetMale={projectResponse?.target_male}
                            targetFemale={projectResponse?.target_female}
                            targetOther={projectResponse?.target_other}
                            targetTotal={projectResponse?.target_total}
                            reachedMale={projectResponse?.reached_male}
                            reachedFemale={projectResponse?.reached_female}
                            reachedOther={projectResponse?.reached_other}
                            reachedTotal={projectResponse?.reached_total}
                        />
                    )}
                </>
            )}
        </Page>
    );
}

Component.displayName = 'ThreeWProjectDetail';
