import { useState, useCallback } from 'react';

import Button from '#components/Button';
import Container from '#components/Container';
import DateOutput from '#components/DateOutput';
import ExpandableContainer from '#components/ExpandableContainer';
import List from '#components/List';
import NumberOutput from '#components/NumberOutput';
import ProgressBar from '#components/ProgressBar';
import ReducedListDisplay from '#components/ReducedListDisplay';
import TextOutput from '#components/TextOutput';
import Tooltip from '#components/Tooltip';
import useBooleanState from '#hooks/useBooleanState';
import useTranslation from '#hooks/useTranslation';
import { numericIdSelector } from '#utils/selectors';
import { resolveToString } from '#utils/translation';
import { type GoApiResponse } from '#utils/restRequest';

import { getPeopleReachedInActivity } from '../useEmergencyProjectStats';
import i18n from './i18n.json';
import styles from './styles.module.css';

type EmergencyProjectResponse = GoApiResponse<'/api/v2/emergency-project/'>;
type EmergencyProject = NonNullable<EmergencyProjectResponse['results']>[number];
type DistrictListItem = NonNullable<EmergencyProject['districts_details']>[number];
type ActivityItem = NonNullable<EmergencyProject['activities']>[number];

interface Props {
    sectorDetails: NonNullable<EmergencyProject['activities']>[number]['sector_details'];
    projects: EmergencyProject[];
}

interface DistrictNameOutputProps {
    name: string;
}

function DistrictNameOutput({ name }: DistrictNameOutputProps) {
    return name;
}

interface ActivityProps {
    activity: ActivityItem;
}

function Activity({ activity }: ActivityProps) {
    const strings = useTranslation(i18n);

    return (
        <Container
            heading={activity.action_details?.title ?? activity.custom_action}
            headingLevel={5}
            spacing="none"
            className={styles.activity}
        >
            <TextOutput
                label={strings.peopleReached}
                value={getPeopleReachedInActivity(activity)}
                description={activity.details}
                strongValue
            />
        </Container>
    );
}

interface ProjectListItemProps {
    project: EmergencyProject;
    sectorDetails: NonNullable<EmergencyProject['activities']>[number]['sector_details'];
}

function ProjectListItem(props: ProjectListItemProps) {
    const {
        project,
        sectorDetails,
    } = props;

    const strings = useTranslation(i18n);

    const [
        detailsShown,
        {
            setTrue: showDetails,
            setFalse: hideDetails,
        },
    ] = useBooleanState(false);
    const districtRendererParams = useCallback(
        (value: DistrictListItem) => ({
            name: value.name,
        }),
        [],
    );

    const nsName = project.activity_lead === 'national_society'
        ? project.reporting_ns_details?.society_name
        : project.deployed_eru_details?.eru_owner_details
            ?.national_society_country_details?.society_name;

    const relatedActivities = project.activities
        ?.filter((activity) => activity.sector === sectorDetails.id);

    const relatedActivityRendererParams = useCallback((_: number, activity: ActivityItem) => ({
        activity,
    }), []);

    return (
        <Container
            className={styles.project}
            heading={nsName}
            headingLevel={5}
            headingContainerClassName={styles.heading}
            headingDescriptionContainerClassName={styles.status}
            headingDescription={project.status_display}
            withoutWrapInHeading
            footerActions={(
                detailsShown ? (
                    <Button
                        variant="tertiary"
                        name={undefined}
                        onClick={hideDetails}
                    >
                        {strings.showLess}
                    </Button>
                ) : (
                    <Button
                        variant="tertiary"
                        name={undefined}
                        onClick={showDetails}
                    >
                        {strings.showMore}
                    </Button>
                )
            )}
            headerDescription={(
                <>
                    <div className={styles.dates}>
                        <DateOutput value={project.start_date} className={styles.date} />
                        <DateOutput value={project.end_date} className={styles.date} />
                    </div>
                    <div>
                        {project.districts_details && (
                            <ReducedListDisplay
                                list={project.districts_details}
                                keySelector={numericIdSelector}
                                renderer={DistrictNameOutput}
                                rendererParams={districtRendererParams}
                                title={strings.provinceOrRegion}
                            />
                        )}
                    </div>
                </>
            )}
        >
            {detailsShown && (
                <List
                    className={styles.activities}
                    data={relatedActivities}
                    renderer={Activity}
                    rendererParams={relatedActivityRendererParams}
                    keySelector={numericIdSelector}
                    pending={false}
                    errored={false}
                    filtered={false}
                />
            )}
        </Container>
    );
}

function ActivityDetail(props: Props) {
    const {
        sectorDetails,
        projects,
    } = props;

    const strings = useTranslation(i18n);

    const [activeProject, setActiveProject] = useState<number | undefined>();

    const projectCount = projects.length;
    const completeProjectCount = projects.filter(
        (project) => project.status === 'complete',
    ).length;

    const projectListRendererParams = useCallback((_: number, project: EmergencyProject) => ({
        project,
        activeProject,
        setActiveProject,
        sectorDetails,
    }), [activeProject, sectorDetails]);

    return (
        <ExpandableContainer
            className={styles.activityDetail}
            heading={sectorDetails.title}
            headingLevel={5}
            headerDescriptionContainerClassName={styles.headerDescriptionContainer}
            headerDescription={(
                <>
                    <div className={styles.progressBarContainer}>
                        <ProgressBar
                            className={styles.progressBar}
                            value={completeProjectCount}
                            totalValue={projectCount}
                        />
                        <Tooltip className={styles.tooltip}>
                            <TextOutput
                                value={resolveToString(
                                    strings.completedProject,
                                    {
                                        totalProjects: projectCount,
                                        completeProjectCount,
                                    },
                                )}
                            />
                        </Tooltip>
                    </div>
                    <NumberOutput
                        value={completeProjectCount}
                    />
                </>
            )}
        >
            <List
                className={styles.projectListItemContainer}
                errored={false}
                pending={false}
                filtered={false}
                data={projects}
                keySelector={numericIdSelector}
                renderer={ProjectListItem}
                rendererParams={projectListRendererParams}
            />
        </ExpandableContainer>
    );
}

export default ActivityDetail;
