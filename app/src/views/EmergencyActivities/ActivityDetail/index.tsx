import {
    useCallback,
    useState,
} from 'react';
import {
    ChevronDownLineIcon,
    ChevronUpLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    ButtonLayout,
    Container,
    DataDisplay,
    ExpandableContainer,
    InlineLayout,
    ListView,
    MoreInfo,
    NumberDisplay,
    ProgressBar,
    RawList,
    TruncatedList,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    resolveToString,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import { type GoApiResponse } from '#utils/restRequest';

import { getPeopleReachedInActivity } from '../useEmergencyProjectStats';

import i18n from './i18n.json';

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
            headingLevel={6}
            backgroundColor="background"
            withPadding
            spacing="xs"
        >
            <DataDisplay
                label={strings.peopleReached}
                value={getPeopleReachedInActivity(activity)}
                description={activity.details}
                strongValue
                textSize="sm"
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
            heading={nsName}
            headingLevel={6}
            // FIXME: use tag component
            headerActions={(
                <ButtonLayout
                    textSize="sm"
                    spacing="3xs"
                    readOnly
                >
                    {project.status_display}
                </ButtonLayout>
            )}
            withoutWrapInHeader
            footerActions={(
                <Button
                    variant="tertiary"
                    name={undefined}
                    onClick={detailsShown ? hideDetails : showDetails}
                    textSize="sm"
                    after={detailsShown ? <ChevronUpLineIcon /> : <ChevronDownLineIcon />}
                >
                    {detailsShown ? strings.showLess : strings.showMore}
                </Button>
            )}
            headerDescription={(
                <ListView
                    spacing="xs"
                    withSpacingOpticalCorrection
                >
                    <DataDisplay
                        value={project.start_date}
                        valueType="date"
                        textSize="sm"
                        description={isDefined(project.end_date) && '-'}
                    />
                    {isDefined(project.end_date) && (
                        <DataDisplay
                            value={project.end_date}
                            valueType="date"
                            textSize="sm"
                        />
                    )}
                </ListView>
            )}
            backgroundColor="foreground"
            withPadding
            spacing="sm"
        >
            <ListView
                layout="block"
                spacing="xs"
            >
                {project.districts_details && (
                    <TruncatedList
                        list={project.districts_details}
                        keySelector={numericIdSelector}
                        renderer={DistrictNameOutput}
                        rendererParams={districtRendererParams}
                        title={strings.provinceOrRegion}
                    />
                )}
                {detailsShown && (
                    <ListView
                        layout="block"
                        spacing="3xs"
                    >
                        <RawList
                            data={relatedActivities}
                            renderer={Activity}
                            rendererParams={relatedActivityRendererParams}
                            keySelector={numericIdSelector}
                        />
                    </ListView>
                )}
            </ListView>
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
            heading={sectorDetails.title}
            headingLevel={5}
            headerDescription={(
                <InlineLayout
                    spacing="sm"
                    after={(
                        <ListView spacing="xs">
                            <NumberDisplay
                                value={projectCount}
                            />
                            <MoreInfo>
                                {resolveToString(
                                    strings.completedProject,
                                    {
                                        totalProjects: projectCount,
                                        completeProjectCount,
                                    },
                                )}
                            </MoreInfo>
                        </ListView>
                    )}
                >
                    <ProgressBar
                        value={completeProjectCount}
                        totalValue={projectCount}
                    />
                </InlineLayout>
            )}
            withPadding
            backgroundColor="background"
            spacing="sm"
        >
            <ListView
                layout="block"
                spacing="2xs"
            >
                <RawList
                    data={projects}
                    keySelector={numericIdSelector}
                    renderer={ProjectListItem}
                    rendererParams={projectListRendererParams}
                />
            </ListView>
        </ExpandableContainer>
    );
}

export default ActivityDetail;
