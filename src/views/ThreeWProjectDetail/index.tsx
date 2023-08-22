import { useContext } from 'react';
import { generatePath, useParams } from 'react-router-dom';
import { InformationLineIcon, PencilFillIcon } from '@ifrc-go/icons';
import { isNotDefined, isDefined } from '@togglecorp/fujs';

import RouteContext from '#contexts/route';
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

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { projectId } = useParams<{ projectId: string }>();

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

    const {
        countryThreeW: countryThreeWRoute,
        country: countryRoute,
        threeWProjectDetail: threeWProjectDetailRoute,
        emergency: emergencyRoute,
    } = useContext(RouteContext);

    const countryLink = projectResponse?.project_country_detail.id
        ? generatePath(
            countryRoute.absolutePath,
            {
                countryId: projectResponse
                    ?.project_country_detail.id,
            },
        ) : undefined;

    const districtList = projectResponse?.project_districts_detail
        ? projectResponse?.project_districts_detail?.map((district) => district?.name).join(', ') : null;

    return (
        <Page
            className={styles.projectThreeW}
            title={strings.threeWDetailsHeading}
            heading={projectResponse?.name}
            actions={(
                <Link
                    variant="secondary"
                    to={generatePath(
                        threeWProjectDetailRoute.absolutePath,
                        { projectId },
                    )}
                    icons={<PencilFillIcon />}
                >
                    {strings.editProject}
                </Link>
            )}
            description={(
                <TextOutput
                    valueClassName={styles.modifiedOnValue}
                    label={strings.lastModifiedOnTitle}
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
                    withoutLabelColon
                />
            )}
        >
            {projectPending ? (
                <BlockLoading />
            ) : (
                <div className={styles.projectList}>
                    <Container
                        childrenContainerClassName={styles.projectDetails}
                    >
                        <TextOutput
                            label={strings.reportingNationalSocietyTitle}
                            value={(
                                <Link
                                    className={styles.countryLink}
                                    withForwardIcon
                                    to={projectResponse?.reporting_ns_detail.id
                                        ? generatePath(
                                            countryThreeWRoute.absolutePath,
                                            {
                                                countryId: projectResponse?.reporting_ns_detail.id,
                                            },
                                        ) : undefined}
                                >
                                    {projectResponse?.reporting_ns_detail?.society_name}
                                </Link>
                            )}
                            withoutLabelColon
                            strongValue
                        />
                        <TextOutput
                            label={strings.countryAndRegionTitle}
                            value={(
                                <>
                                    <Link
                                        className={styles.countryLink}
                                        withForwardIcon
                                        to={countryLink}
                                    >
                                        {projectResponse?.project_country_detail?.name}
                                    </Link>
                                    {districtList}
                                </>
                            )}
                            strongValue
                            withoutLabelColon
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
                                    withoutLabelColon
                                />
                                <TextOutput
                                    label={strings.nsContactLabel}
                                    value={(
                                        <Link
                                            to={`mailto:${projectResponse?.reporting_ns_contact_email}`}
                                        >
                                            {projectResponse?.reporting_ns_contact_email}
                                        </Link>
                                    )}
                                    strongValue
                                    withoutLabelColon
                                />
                            </>
                        )}
                        <TextOutput
                            label={strings.projectTypeLabel}
                            value={projectResponse?.operation_type_display}
                            strongValue
                            withoutLabelColon
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
                                                withoutLabelColon
                                                strongLabel
                                            />
                                        </Tooltip>
                                    </span>
                                </>
                            )}
                            value={projectResponse?.programme_type_display}
                            strongValue
                            withoutLabelColon
                        />
                        <TextOutput
                            label={strings.linkedOperationLabel}
                            value={(
                                <Link
                                    className={styles.countryLink}
                                    to={projectResponse?.event_detail?.id ? generatePath(
                                        emergencyRoute.absolutePath,
                                        {
                                            emergencyId: projectResponse?.event_detail?.id,
                                        },
                                    ) : undefined}
                                >
                                    {projectResponse?.event_detail?.name}
                                </Link>
                            )}
                            strongValue
                            withoutLabelColon
                        />
                        <TextOutput
                            label={strings.disasterTypeLabel}
                            value={projectResponse?.dtype_detail?.name}
                            strongValue
                            withoutLabelColon
                        />
                        <TextOutput
                            label={strings.primarySectorLabel}
                            value={projectResponse?.primary_sector_display}
                            strongValue
                            withoutLabelColon
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
                                                withoutLabelColon
                                                strongLabel
                                            />
                                        </Tooltip>
                                    </span>
                                </>
                            )}
                            value={projectResponse?.secondary_sectors_display}
                            strongValue
                            withoutLabelColon
                        />
                        <TextOutput
                            label={strings.threeWStartDate}
                            value={projectResponse?.start_date}
                            valueType="date"
                            strongValue
                            withoutLabelColon
                        />
                        <TextOutput
                            label={strings.threeWEndDate}
                            value={projectResponse?.end_date}
                            valueType="date"
                            strongValue
                            withoutLabelColon
                        />
                        <TextOutput
                            label={strings.statusLabel}
                            value={projectResponse?.status_display}
                            strongValue
                            withoutLabelColon
                        />
                        <TextOutput
                            label={strings.budgetAmountLabel}
                            value={projectResponse?.budget_amount}
                            valueType="number"
                            strongValue
                            withoutLabelColon
                        />
                    </Container>
                    <div className={styles.separator} />
                    {projectResponse !== undefined
                        && projectResponse?.annual_split_detail?.length > 0
                        ? (
                            <div className={styles.yearDetail}>
                                {projectResponse?.annual_split_detail?.map((split) => (
                                    <>
                                        <TextOutput
                                            className={styles.year}
                                            label={strings.threeWYear}
                                            value={split.year}
                                            strongValue
                                            withoutLabelColon
                                        />
                                        <div className={styles.yearList}>
                                            <TextOutput
                                                className={styles.budget}
                                                label={strings.threeWBudgetAmount}
                                                value={split.budget_amount}
                                                valueType="number"
                                                strongValue
                                                withoutLabelColon
                                            />
                                            <div className={styles.budget}>
                                                {strings.threeWPeopleTargeted}
                                            </div>
                                            <TextOutput
                                                className={styles.gender}
                                                label={strings.threeWMale}
                                                value={split.target_male}
                                                valueType="number"
                                                strongValue
                                                withoutLabelColon
                                            />
                                            <TextOutput
                                                className={styles.gender}
                                                label={strings.threeWFemale}
                                                value={split.target_female}
                                                valueType="number"
                                                strongValue
                                                withoutLabelColon
                                            />
                                            <TextOutput
                                                className={styles.gender}
                                                label={strings.threeWOther}
                                                value={split.target_other}
                                                valueType="number"
                                                strongValue
                                                withoutLabelColon
                                            />
                                            <TextOutput
                                                className={styles.gender}
                                                label={strings.threeWTotal}
                                                value={split.target_total}
                                                valueType="number"
                                                strongValue
                                                withoutLabelColon
                                            />
                                            <div>
                                                &nbsp;
                                            </div>
                                            <div>
                                                <div className={styles.budget}>
                                                    {strings.threeWPeopleReached1}
                                                </div>
                                            </div>
                                            <TextOutput
                                                className={styles.gender}
                                                label={strings.threeWMale}
                                                value={split.reached_male}
                                                valueType="number"
                                                strongValue
                                                withoutLabelColon
                                            />
                                            <TextOutput
                                                className={styles.gender}
                                                label={strings.threeWFemale}
                                                value={split.reached_female}
                                                valueType="number"
                                                strongValue
                                                withoutLabelColon
                                            />
                                            <TextOutput
                                                className={styles.gender}
                                                label={strings.threeWOther}
                                                value={split.reached_other}
                                                valueType="number"
                                                strongValue
                                                withoutLabelColon
                                            />
                                            <TextOutput
                                                className={styles.gender}
                                                label={strings.threeWTotal}
                                                value={split.reached_total}
                                                valueType="number"
                                                strongValue
                                                withoutLabelColon
                                            />
                                        </div>
                                    </>
                                ))}
                            </div>
                        )
                        : (
                            <>
                                <div className={styles.yearDetail}>
                                    <div className={styles.peopleTargeted}>
                                        <div className={styles.budget}>
                                            {strings.threeWPeopleTargeted}
                                        </div>
                                        <TextOutput
                                            className={styles.gender}
                                            label={strings.threeWMale}
                                            value={projectResponse?.target_male}
                                            valueType="number"
                                            strongValue
                                            withoutLabelColon
                                        />
                                        <TextOutput
                                            className={styles.gender}
                                            label={strings.threeWFemale}
                                            value={projectResponse?.target_female}
                                            valueType="number"
                                            strongValue
                                            withoutLabelColon
                                        />
                                        <TextOutput
                                            className={styles.gender}
                                            label={strings.threeWOther}
                                            value={projectResponse?.target_other}
                                            valueType="number"
                                            strongValue
                                            withoutLabelColon
                                        />
                                        <TextOutput
                                            className={styles.gender}
                                            label={strings.threeWTotal}
                                            value={projectResponse?.target_total}
                                            valueType="number"
                                            strongValue
                                            withoutLabelColon
                                        />
                                    </div>
                                </div>
                                <div className={styles.yearDetail}>
                                    <div className={styles.peopleTargeted}>
                                        <div className={styles.budget}>
                                            {strings.threeWPeopleReached1}
                                        </div>
                                        <TextOutput
                                            className={styles.gender}
                                            label={strings.threeWMale}
                                            value={projectResponse?.reached_male}
                                            valueType="number"
                                            strongValue
                                            withoutLabelColon
                                        />
                                        <TextOutput
                                            className={styles.gender}
                                            label={strings.threeWFemale}
                                            value={projectResponse?.reached_female}
                                            valueType="number"
                                            strongValue
                                            withoutLabelColon
                                        />
                                        <TextOutput
                                            className={styles.gender}
                                            label={strings.threeWOther}
                                            value={projectResponse?.reached_other}
                                            valueType="number"
                                            strongValue
                                            withoutLabelColon
                                        />
                                        <TextOutput
                                            className={styles.gender}
                                            label={strings.threeWTotal}
                                            value={projectResponse?.reached_total}
                                            valueType="number"
                                            strongValue
                                            withoutLabelColon
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                </div>
            )}
        </Page>
    );
}

Component.displayName = 'ThreeWProjectDetail';
