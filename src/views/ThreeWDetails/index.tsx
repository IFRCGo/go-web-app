import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { PencilFillIcon } from "@ifrc-go/icons";
import { isNotDefined } from "@togglecorp/fujs";

import { useRequest } from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';
import Link from "#components/Link";
import Page from "#components/Page";
import { paths } from "#generated/types";
import TextOutput from "#components/TextOutput";
import BlockLoading from "#components/BlockLoading";
import Tooltip from "#components/Tooltip";

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { threeWId } = useParams<{ threeWId: string }>();

    type ProjectResponse = paths['/api/v2/project/{id}/']['get']['responses']['200']['content']['application/json'];

    const {
        response: projectResponse,
    } = useRequest<ProjectResponse>({
        skip: isNotDefined(threeWId),
        url: '/api/v2/project/{id}/',
        pathVariables: {
            id: threeWId,
        },
    });

    const displayName = useMemo(() => {
        if (!projectResponse?.modified_by_detail) {
            return undefined;
        }

        const {
            username,
        } = projectResponse.modified_by_detail;

        return username;
    }, [projectResponse?.modified_by_detail]);

    return (
        <Page
            className={styles.projectThreeW}
            title="3W Details"
            heading={projectResponse?.name}
            actions={(
                // FIXME: use route from context
                <Link
                    to="/three-w/new"
                    variant="secondary"
                    icons={<PencilFillIcon />}
                >
                    Edit Project
                </Link>
            )}
            descriptionContainerClassName={styles.description}
            description={
                <TextOutput
                    label="Last Modified On"
                    value={projectResponse?.modified_at}
                    valueType="date"
                    description={displayName}
                />
            }
        >
            {projectResponse?.description ? (
                <BlockLoading />
            ) : (
                //  FIX ME: Add flex gap
                <>
                    <div className={styles.projectDetails}>
                        <TextOutput
                            labelClassName={styles.projectDetailLabel}
                            label="Reporting National Society"
                            value={
                                <Link
                                    className={styles.countryLink}
                                    to={'/countries/' + projectResponse?.reporting_ns_detail?.id + '#3w'}
                                >
                                    {projectResponse?.project_country_detail?.society_name}
                                </Link>
                            }
                        />
                        <TextOutput
                            labelClassName={styles.projectDetailLabel}
                            label="Country And Region/Province"
                            value={
                                <>
                                    <Link
                                        className={styles.countryLink}
                                        to={'/countries/' + projectResponse?.project_country_detail?.id + '#operations'}
                                    >
                                        {projectResponse?.project_country_detail?.name}
                                    </Link>
                                    {projectResponse?.project_districts_detail?.map(d => d.name).join(', ')}
                                </>
                            }
                        />
                        {projectResponse?.reporting_ns_contact_name === null ? '' :
                            <>
                                <TextOutput
                                    label="NS contact name, role"
                                    value={projectResponse?.reporting_ns_contact_name + ', ' +
                                        projectResponse?.reporting_ns_contact_role}
                                />
                                <TextOutput
                                    label="NS contact email"
                                    value={projectResponse?.reporting_ns_contact_email}
                                />
                            </>
                        }
                        <TextOutput
                            labelClassName={styles.projectDetailLabel}
                            label="Project Type"
                            value={projectResponse?.operation_type_display + ''}
                        />
                        <TextOutput
                            labelClassName={styles.projectDetailLabel}
                            label="Programme Type"
                            value={projectResponse?.programme_type_display}
                        />
                        <TextOutput
                            label="Linked Operation"
                            labelClassName={styles.projectDetailLabel}
                            value={projectResponse?.event_detail ?
                                <Link
                                    className={styles.countryLink}
                                    to={'/emergencies/' + projectResponse?.event_detail?.id}
                                >
                                    {projectResponse?.event_detail?.name}
                                </Link>
                                : ''}
                        />
                        <TextOutput
                            labelClassName={styles.projectDetailLabel}
                            label="Disaster Type"
                            value={projectResponse?.dtype_detail?.name}
                        />
                        <TextOutput
                            label="Primary Sector"
                            value={projectResponse?.primary_sector_display}
                        />
                        <TextOutput
                            labelClassName={styles.projectDetailLabel}
                            label={
                                <>
                                    {strings.tagsTitle}
                                    <Tooltip
                                        children={strings.threeWTagsTooltip}
                                    />
                                </>
                            }
                            value={projectResponse?.secondary_sectors_display}
                        />
                        <TextOutput
                            labelClassName={styles.projectDetailLabel}
                            label={strings.threeWStartDate}
                            value={projectResponse?.start_date}
                            valueType="date"
                        />
                        <TextOutput
                            label={strings.threeWEndDate}
                            labelClassName={styles.projectDetailLabel}
                            value={projectResponse?.end_date}
                            valueType="date"
                        />
                        <TextOutput
                            labelClassName={styles.projectDetailLabel}
                            label="Status"
                            value={projectResponse?.status_display}
                        />
                        <TextOutput
                            label="Budget Amount (CHF)"
                            labelClassName={styles.projectDetailLabel}
                            value={projectResponse?.budget_amount}
                            valueType="number"
                        />
                    </div>
                    <div className={styles.separator} />
                    {projectResponse?.annual_split_detail?.map(split => {
                        return (
                            <div className={styles.projectDetails}>

                                <TextOutput
                                    // label={strings.threeWYear}
                                    value={split.year}
                                />

                                <TextOutput
                                    // label={strings.threeWBudgetAmount}
                                    value={split.budget_amount}
                                    valueType="number"
                                />
                                <TextOutput
                                    // label={strings.threeWMale}
                                    value={split.target_male}
                                    valueType="number"
                                    className={styles.grey}
                                />
                                <TextOutput
                                    // label={strings.threeWFemale}
                                    value={split.target_female}
                                    valueType="number"
                                    className={styles.grey}
                                />
                                <TextOutput
                                    // label={strings.threeWOther}
                                    value={split.target_other}
                                    valueType="number"
                                    className={styles.grey}
                                />
                                <TextOutput
                                    // label={strings.threeWTotal}
                                    value={split.target_total}
                                    valueType="number"
                                    className={styles.grey}
                                />
                                {/* {strings.threeWPeopleReached1} */}
                                <TextOutput
                                    // label={strings.threeWMale}
                                    value={split.reached_male}
                                    valueType="number"
                                    className={styles.grey}
                                />
                                <TextOutput
                                    // label={strings.threeWFemale}
                                    value={split.reached_female}
                                    valueType="number"
                                    className={styles.grey}
                                />
                                <TextOutput
                                    // label={strings.threeWOther}
                                    value={split.reached_other}
                                    valueType="number"
                                    className={styles.grey}
                                />
                                <TextOutput
                                    // label={strings.threeWTotal}
                                    value={split.reached_total}
                                    valueType="number"
                                    className={styles.grey}
                                />
                            </div>
                        );
                    })}
                    <div className={styles.peopleDetail}>
                        <div>
                            People Targeted
                        </div>
                        <TextOutput
                            label="Male"
                            labelClassName={styles.projectDetailLabel}
                            value={projectResponse?.target_male}
                            valueType="number"
                        />
                        <TextOutput
                            label="Female"
                            labelClassName={styles.projectDetailLabel}
                            value={projectResponse?.target_female}
                            valueType="number"
                        />
                        <TextOutput
                            label="Other"
                            labelClassName={styles.projectDetailLabel}
                            value={projectResponse?.target_other}
                            valueType="number"
                        />
                        <TextOutput
                            label="Total"
                            labelClassName={styles.projectDetailLabel}
                            value={projectResponse?.target_other}
                            valueType="number"
                        />
                        <div>
                            People Reached
                        </div>
                        <TextOutput
                            label="Male"
                            labelClassName={styles.projectDetailLabel}
                            value={projectResponse?.reached_male}
                            valueType="number"
                        />
                        <TextOutput
                            label="Female"
                            labelClassName={styles.projectDetailLabel}
                            value={projectResponse?.reached_female}
                            valueType="number"
                        />
                        <TextOutput
                            label="Other"
                            labelClassName={styles.projectDetailLabel}
                            value={projectResponse?.reached_other}
                            valueType="number"
                        />
                        <TextOutput
                            label="Total"
                            labelClassName={styles.projectDetailLabel}
                            value={projectResponse?.reached_total}
                            valueType="number"
                        />
                    </div>
                </>
            )}
        </Page >
    );
}

Component.displayName = 'ThreeWDetails';