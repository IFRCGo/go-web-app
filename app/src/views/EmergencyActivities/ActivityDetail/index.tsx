import {
    useCallback,
    useState,
} from 'react';
import {
    Button,
    Container,
    DateOutput,
    ExpandableContainer,
    InfoPopup,
    List,
    NumberOutput,
    ProgressBar,
    ReducedListDisplay,
    TextOutput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    resolveToString,
} from '@ifrc-go/ui/utils';

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
            spacing="cozy"
            className={styles.activity}
            withInternalPadding
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
            className={styles.projectListItem}
            heading={nsName}
            headingLevel={5}
            actions={(
                <div className={styles.status}>
                    {project.status_display}
                </div>
            )}
            withoutWrapInHeading
            spacing="condensed"
            withInternalPadding
            footerActions={(
                <Button
                    variant="tertiary"
                    name={undefined}
                    onClick={detailsShown ? hideDetails : showDetails}
                >
                    {detailsShown ? strings.showLess : strings.showMore}
                </Button>
            )}
            headerDescriptionContainerClassName={styles.dates}
            headerDescription={(
                <>
                    <DateOutput
                        value={project.start_date}
                    />
                    <DateOutput
                        value={project.end_date}
                    />
                </>
            )}
        >
            {project.districts_details && (
                <ReducedListDisplay
                    list={project.districts_details}
                    keySelector={numericIdSelector}
                    renderer={DistrictNameOutput}
                    rendererParams={districtRendererParams}
                    title={strings.provinceOrRegion}
                />
            )}
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
                    compact
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
            headingLevel={4}
            headerDescriptionContainerClassName={styles.headerDescriptionContainer}
            withHeaderBorder
            headerDescription={(
                <>
                    <ProgressBar
                        className={styles.progressBar}
                        value={completeProjectCount}
                        totalValue={projectCount}
                    />
                    <NumberOutput
                        value={projectCount}
                    />
                    <InfoPopup
                        description={resolveToString(
                            strings.completedProject,
                            {
                                totalProjects: projectCount,
                                completeProjectCount,
                            },
                        )}
                    />
                </>
            )}
        >
            <List
                className={styles.projectListContainer}
                errored={false}
                pending={false}
                filtered={false}
                data={projects}
                keySelector={numericIdSelector}
                renderer={ProjectListItem}
                rendererParams={projectListRendererParams}
                compact
            />
        </ExpandableContainer>
    );
}

export default ActivityDetail;
