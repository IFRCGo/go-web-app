import { useContext } from 'react';
import { generatePath, useParams } from 'react-router-dom';
import { PencilFillIcon } from '@ifrc-go/icons';
import { isNotDefined } from '@togglecorp/fujs';

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

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { threeWId } = useParams<{ threeWId: string }>();

    const {
        response: projectResponse,
    } = useRequest({
        skip: isNotDefined(threeWId),
        url: '/api/v2/project/{id}/',
        pathVariables: {
            id: Number(threeWId),
        },
    });

    const {
        country: countryRoute,
        threeW: threeWRoute,
        emergencies: emergenciesRoute,
    } = useContext(RouteContext);

    return (
        <Page
            className={styles.projectThreeW}
            title={strings.threeWDetailsHeading}
            heading={projectResponse?.name}
            actions={(
                <Link
                    variant="secondary"
                    to={generatePath(
                        threeWRoute.absolutePath,
                        { threeWId },
                    )}
                    icons={<PencilFillIcon />}
                >
                    {strings.editProject}
                </Link>
            )}
            descriptionContainerClassName={styles.description}
            description={resolveToComponent(strings.lastModifiedOnTitle, {
                date: (
                    <DateOutput
                        value={projectResponse?.modified_at}
                    />
                ),
            })}
        >
            <div className={styles.projectList}>
                <Container
                    childrenContainerClassName={styles.projectDetails}
                >
                    <TextOutput
                        label={strings.reportingNationalSocietyTitle}
                        value={(
                            <Link
                                className={styles.countryLink}
                                to={projectResponse?.reporting_ns_detail
                                    ? generatePath(
                                        countryRoute.absolutePath,
                                        {
                                            countryId: projectResponse
                                                ?.reporting_ns_detail?.id ?? 0,
                                        },
                                    ) : undefined}
                            >
                                {projectResponse?.project_country_detail?.society_name}
                            </Link>
                        )}
                    />
                    <TextOutput
                        label={strings.countryAndRegionTitle}
                        value={
                            (
                                <>
                                    <Link
                                        className={styles.countryLink}
                                        to={projectResponse?.project_country_detail
                                            ? generatePath(
                                                emergenciesRoute.absolutePath,
                                                {
                                                    countryId: projectResponse
                                                        ?.project_country_detail?.id ?? 0,
                                                },
                                            ) : undefined}
                                    >
                                        {projectResponse?.project_country_detail?.name}
                                    </Link>
                                    {projectResponse?.project_districts_detail?.map((district) => district?.name).join(', ')}
                                </>
                            )
                        }
                    />
                    {projectResponse?.reporting_ns_contact_name === null ? ''
                        : (
                            <>
                                <TextOutput
                                    label={strings.nSContactTitle}
                                    value={
                                        `${projectResponse?.reporting_ns_contact_name ?? ''}
                                            ,
                                             ${projectResponse?.reporting_ns_contact_role ?? ''}`
                                    }
                                />
                                <TextOutput
                                    label={strings.nsContactLabel}
                                    value={projectResponse?.reporting_ns_contact_email}
                                />
                            </>
                        )}
                    <TextOutput
                        label={strings.projectTypeLabel}
                        value={projectResponse?.operation_type_display ?? 0}
                    />
                    <TextOutput
                        label={strings.programmeTypeLabel}
                        value={projectResponse?.programme_type_display}
                    />
                    <TextOutput
                        label={strings.linkedOperationLabel}
                        value={projectResponse?.event_detail
                            ? (
                                <Link
                                    className={styles.countryLink}
                                    to={emergenciesRoute.absolutePath
                                        + (projectResponse?.event_detail?.id ?? 0)}
                                >
                                    {projectResponse?.event_detail?.name}
                                </Link>
                            ) : ''}
                    />
                    <TextOutput
                        label={strings.disasterTypeLabel}
                        value={projectResponse?.dtype_detail?.name}
                    />
                    <TextOutput
                        label={strings.primarySectorLabel}
                        value={projectResponse?.primary_sector_display}
                    />
                    <TextOutput
                        label={
                            (
                                <>
                                    {strings.tagsTitle}
                                    <Tooltip>
                                        {strings.threeWTagsTooltip}
                                    </Tooltip>
                                </>
                            )
                        }
                        value={projectResponse?.secondary_sectors_display}
                    />
                    <TextOutput
                        label={strings.threeWStartDate}
                        value={projectResponse?.start_date}
                        valueType="date"
                    />
                    <TextOutput
                        label={strings.threeWEndDate}
                        value={projectResponse?.end_date}
                        valueType="date"
                    />
                    <TextOutput
                        label={strings.statusLabel}
                        value={projectResponse?.status_display}
                    />
                    <TextOutput
                        label={strings.primarySectorLabel}
                        value={projectResponse?.budget_amount}
                        valueType="number"
                    />
                </Container>
                <div className={styles.separator} />
                {projectResponse?.annual_split_detail?.map((split) => (
                    <Container
                        childrenContainerClassName={styles.projectDetails}
                    >
                        <TextOutput
                            label={strings.threeWYear}
                            value={split.year}
                        />
                        <TextOutput
                            label={strings.threeWBudgetAmount}
                            value={split.budget_amount}
                            valueType="number"
                        />
                        <TextOutput
                            label={strings.threeWMale}
                            value={split.target_male}
                            valueType="number"
                        />
                        <TextOutput
                            label={strings.threeWFemale}
                            value={split.target_female}
                            valueType="number"
                        />
                        <TextOutput
                            label={strings.threeWOther}
                            value={split.target_other}
                            valueType="number"
                        />
                        <TextOutput
                            label={strings.threeWTotal}
                            value={split.target_total}
                            valueType="number"
                        />
                        {strings.threeWPeopleReached1}
                        <TextOutput
                            label={strings.threeWMale}
                            value={split.reached_male}
                            valueType="number"
                        />
                        <TextOutput
                            label={strings.threeWFemale}
                            value={split.reached_female}
                            valueType="number"
                        />
                        <TextOutput
                            label={strings.threeWOther}
                            value={split.reached_other}
                            valueType="number"
                        />
                        <TextOutput
                            label={strings.threeWTotal}
                            value={split.reached_total}
                            valueType="number"
                        />
                    </Container>
                ))}
                <Container
                    childrenContainerClassName={styles.peopleDetail}
                >
                    <div>
                        {strings.peopleTargeted}
                    </div>
                    <TextOutput
                        label={strings.threeWMale}
                        value={projectResponse?.target_male}
                        valueType="number"
                    />
                    <TextOutput
                        label={strings.threeWFemale}
                        value={projectResponse?.target_female}
                        valueType="number"
                    />
                    <TextOutput
                        label={strings.threeWOther}
                        value={projectResponse?.target_other}
                        valueType="number"
                    />
                    <TextOutput
                        label={strings.threeWTotal}
                        value={projectResponse?.target_other}
                        valueType="number"
                    />
                    <div>
                        {strings.peopleReached}
                    </div>
                    <TextOutput
                        label={strings.threeWMale}
                        value={projectResponse?.reached_male}
                        valueType="number"
                    />
                    <TextOutput
                        label={strings.threeWFemale}
                        value={projectResponse?.reached_female}
                        valueType="number"
                    />
                    <TextOutput
                        label={strings.threeWOther}
                        value={projectResponse?.reached_other}
                        valueType="number"
                    />
                    <TextOutput
                        label={strings.threeWTotal}
                        value={projectResponse?.reached_total}
                        valueType="number"
                    />
                </Container>
            </div>
        </Page>
    );
}

Component.displayName = 'ThreeWDetails';
