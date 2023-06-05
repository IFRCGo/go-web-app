import React from 'react';

import Page from '#components/Page';
import Tabs from '#components/Tabs';
import TabList from '#components/Tabs/TabList';
import Tab from '#components/Tabs/Tab';
import Button from '#components/Button';
import TabPanel from '#components/Tabs/TabPanel';
import useTranslation from '#hooks/useTranslation';
import scrollToTop from '#utils/scrollToTop';

import PerOverview from './PerOverview';
import Assessment from './AssessmentForm';
import Prioritization from './Prioritization';
// import WorkPlan from './WorkPlan';
import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
    // history: History;
    // location: Location;
}
type StepTypes = 'overview' | 'assessment' | 'prioritization' | 'workPlan';

// eslint-disable-next-line import/prefer-default-export
export function Component(props: Props) {
    const strings = useTranslation(i18n);

    const {
        className,
    } = props;

    const [currentStep, setCurrentStep] = React.useState<StepTypes>('prioritization');

    const handleTabChange = React.useCallback(
        (newStep: StepTypes) => {
            setCurrentStep(newStep);
            scrollToTop();
        },
        [],
    );

    return (
        <Tabs
            disabled={undefined}
            onChange={handleTabChange}
            value={currentStep}
            variant="step"
        >
            <Page
                className={className}
                actions={(
                    <>
                        <Button
                            variant="secondary"
                            name={undefined}
                            onClick={undefined}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            name={undefined}
                            onClick={undefined}
                        >
                            Save and Close
                        </Button>
                    </>
                )}
                title={strings.perFormTitle}
                heading={strings.perFormHeading}
                description={strings.perFormProcessDescription}
                info={(
                    <TabList className={styles.tabList}>
                        <Tab
                            name="overview"
                            step={1}
                            errored={undefined}
                        >
                            {strings.perFormTabOverviewLabel}
                        </Tab>
                        <Tab
                            name="assessment"
                            step={2}
                            errored={undefined}
                        >
                            {strings.perFormTabAssessmentLabel}
                        </Tab>
                        <Tab
                            name="prioritization"
                            step={3}
                            errored={undefined}
                        >
                            {strings.perFormTabPrioritizationLabel}
                        </Tab>
                        <Tab
                            name="workPlan"
                            step={4}
                            errored={undefined}
                        >
                            {strings.perFormTabWorkPlanLabel}
                        </Tab>
                    </TabList>
                )}
            >
                <TabPanel name="overview">
                    <PerOverview />
                </TabPanel>
                <TabPanel name="assessment">
                    <Assessment />
                </TabPanel>
                <TabPanel name="prioritization">
                    <Prioritization />
                </TabPanel>
                <TabPanel name="workPlan">
                    {/* <WorkPlan /> */}
                    <div> Work Plan </div>
                </TabPanel>
            </Page>
        </Tabs>
    );
}

Component.displayName = 'PerProcessForm';
