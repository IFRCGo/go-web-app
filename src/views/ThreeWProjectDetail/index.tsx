import { useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { InformationLineIcon, PencilFillIcon } from '@ifrc-go/icons';
import { isNotDefined, isDefined } from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';
import useTranslation from '#hooks/useTranslation';
import Link from '#components/Link';
import Page from '#components/Page';
import TextOutput from '#components/TextOutput';
import Container from '#components/Container';
import Tooltip from '#components/Tooltip';
import DateOutput from '#components/DateOutput';
import BlockLoading from '#components/BlockLoading';
import List from '#components/List';
import type { GoApiResponse } from '#utils/restRequest';

import AnnualSplitListItem, { type Props as AnnualSplitProps } from './AnnualSplitListItem';

import i18n from './i18n.json';
import styles from './styles.module.css';

type ProjectItem = NonNullable<GoApiResponse<'/api/v2/project/'>['results']>[number];
type AnnualSplitItem = NonNullable<ProjectItem['annual_split_detail']>[number];

const annualSplitKeySelector = (item: AnnualSplitItem) => item.id;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { projectId } = useParams<{ projectId: string }>();

    // TODO: Show appropriate message if item is not present in server
    const {
        response: projectResponse,
        pending: projectPending,
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

    const annualSplitListRendererParams = useCallback((
        _: number,
        data: AnnualSplitItem,
    ): AnnualSplitProps => ({
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

        isAnnualSplit: true,
    }), []);

    return (
        <Page
            className={styles.projectThreeW}
            title={strings.threeWDetailsHeading}
            heading={projectResponse?.name}
            actions={(
                <Link
                    variant="secondary"
                    to="threeWProjectEdit"
                    urlParams={{ projectId }}
                    icons={<PencilFillIcon />}
                >
                    {strings.editProject}
                </Link>
            )}
            description={(
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
                                    user: projectResponse?.modified_by_detail?.username,
                                })
                            )}
                        </>
                    )}
                    strongLabel
                />
            )}
        >
            {projectPending ? (
                <BlockLoading />
            ) : (
                <div className={styles.projectList}>
                    <Container childrenContainerClassName={styles.projectDetails}>
                        <TextOutput
                            label={strings.reportingNationalSocietyTitle}
                            value={(
                                <Link
                                    className={styles.countryLink}
                                    withForwardIcon
                                    to="countriesThreeWLayout"
                                    urlParams={{
                                        countryId: projectResponse?.reporting_ns_detail.id,
                                    }}
                                >
                                    {projectResponse?.reporting_ns_detail?.society_name}
                                </Link>
                            )}
                            strongValue
                        />
                        <TextOutput
                            label={strings.countryAndRegionTitle}
                            value={(
                                <Link
                                    className={styles.countryLink}
                                    withForwardIcon
                                    to="countriesLayout"
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
                                            to={`mailto:${projectResponse?.reporting_ns_contact_email}`}
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
                            label={(
                                <>
                                    {strings.programmeTypeLabel}
                                    <span>
                                        <InformationLineIcon />
                                        <Tooltip className={styles.tooltip}>
                                            <TextOutput
                                                label={strings.projectTypeToolTipLabel}
                                                value={strings.projectTypeToolTipValue}
                                                strongLabel
                                            />
                                        </Tooltip>
                                    </span>
                                </>
                            )}
                            value={projectResponse?.programme_type_display}
                            strongValue
                        />
                        <TextOutput
                            label={strings.linkedOperationLabel}
                            value={(
                                <Link
                                    className={styles.countryLink}
                                    to="emergenciesLayout"
                                    urlParams={{
                                        emergencyId: projectResponse?.event_detail?.id,
                                    }}
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
                            label={(
                                <>
                                    {strings.tagsTitle}
                                    <span>
                                        <InformationLineIcon />
                                        <Tooltip className={styles.tooltip}>
                                            <TextOutput
                                                label={strings.peopleReachedToolTipLabel}
                                                value={strings.peopleReachedToolTipValue}
                                                strongLabel
                                            />
                                        </Tooltip>
                                    </span>
                                </>
                            )}
                            value={projectResponse?.secondary_sectors_display}
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
                        <TextOutput
                            label={strings.budgetAmountLabel}
                            value={projectResponse?.budget_amount}
                            valueType="number"
                            strongValue
                        />
                    </Container>
                    {(projectResponse?.annual_split_detail?.length ?? 0) > 0 ? (
                        <List
                            data={projectResponse?.annual_split_detail}
                            className={styles.yearDetail}
                            renderer={AnnualSplitListItem}
                            rendererParams={annualSplitListRendererParams}
                            keySelector={annualSplitKeySelector}
                            pending={projectPending}
                            errored={false}
                            filtered={false}
                        />
                    ) : (
                        <AnnualSplitListItem
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
                </div>
            )}
        </Page>
    );
}

Component.displayName = 'ThreeWProjectDetail';
