import {
    Fragment,
    useMemo,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    ArrowDownSmallFillIcon,
    ArrowUpSmallFillIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    Label,
    ListView,
    NumberOutput,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { DescriptionText } from '@ifrc-go/ui/printable';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import TabPage from '#components/TabPage';
import { type EmergencyOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface InterventionProps {
    data: NonNullable<NonNullable<EmergencyOutletContext['drefApplication']>['planned_interventions']>[number];
    stage: NonNullable<EmergencyOutletContext['drefStage']> | undefined;
}

function Intervention(props: InterventionProps) {
    const {
        data: intervention,
        stage,
    } = props;

    const strings = useTranslation(i18n);

    const [showDetails, setShowDetails] = useState(false);

    return (
        <Container
            withShadow
            withBackground
            withPadding
        >
            <div
                className={_cs(
                    styles.operationRow,
                    stage === 'application' && styles.applicationStage,
                )}
            >
                <ListView spacing="sm">
                    <img
                        className={styles.sectorIcon}
                        src={intervention.image_url}
                        alt={intervention.title}
                    />
                    <Label strong>
                        {intervention.title_display}
                    </Label>
                </ListView>
                <TextOutput
                    label={strings.plannedOperationBudgetLabel}
                    value={intervention.budget}
                    valueType="number"
                    strongValue
                />
                <TextOutput
                    label={strings.plannedOperationPeopleTargetedLabel}
                    value={intervention.person_targeted}
                    valueType="number"
                    strongValue
                />
                <TextOutput
                    label={strings.plannedOperationPeopleReachedLabel}
                    value={intervention.person_assisted}
                    valueType="number"
                    strongValue
                />
                <Button
                    name={!showDetails}
                    styleVariant="action"
                    onClick={setShowDetails}
                >
                    {showDetails ? <ArrowUpSmallFillIcon /> : <ArrowDownSmallFillIcon /> }
                </Button>
            </div>
            {showDetails && (
                <ListView layout="block">
                    <ListView
                        layout="grid"
                        withPadding
                        withDarkBackground
                        withSpacingOpticalCorrection
                    >
                        <Label strong>
                            {/* FIXME: use strings */}
                            Indicators
                        </Label>
                        <Label strong>
                            {/* FIXME: use strings */}
                            Targeted
                        </Label>
                        {intervention.indicators?.map((indicator) => (
                            <Fragment key={indicator.id}>
                                <Label>
                                    {indicator.title}
                                </Label>
                                <NumberOutput
                                    value={indicator.target}
                                />
                            </Fragment>
                        ))}
                    </ListView>
                    {intervention.description && (
                        <Container
                            withPadding
                            withDarkBackground
                            heading="Activities"
                            headingLevel={6}
                        >
                            <DescriptionText>
                                {intervention.description}
                            </DescriptionText>
                        </Container>
                    )}
                    {intervention.challenges && (
                        <Container
                            withPadding
                            withDarkBackground
                            heading="Challenges"
                            headingLevel={6}
                        >
                            <DescriptionText>
                                {intervention.challenges}
                            </DescriptionText>
                        </Container>
                    )}
                    {intervention.narrative_description_of_achievements && (
                        <Container
                            withPadding
                            withDarkBackground
                            heading="Achievements"
                            headingLevel={6}
                        >
                            <DescriptionText>
                                {intervention.narrative_description_of_achievements}
                            </DescriptionText>
                        </Container>
                    )}
                </ListView>
            )}
        </Container>
    );
}

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const {
        drefStage,
        drefApplication,
        drefFinalReport,
        drefOpsUpdate,
    } = useOutletContext<EmergencyOutletContext>();

    const strings = useTranslation(i18n);

    const drefDetails = useMemo(() => {
        if (drefStage === 'final-report') {
            return drefFinalReport;
        }

        if (drefStage === 'ops-update') {
            return drefOpsUpdate;
        }

        return drefApplication;
    }, [drefStage, drefApplication, drefOpsUpdate, drefFinalReport]);

    return (
        <TabPage>
            <Container
                heading={strings.plannedOperationHeading}
                className={styles.plannedOperations}
                withHeaderBorder
                empty={isNotDefined(drefDetails?.planned_interventions)
                    || drefDetails?.planned_interventions?.length === 0}
            >
                {drefDetails?.planned_interventions?.map((intervention) => (
                    <Intervention
                        key={intervention.id}
                        data={intervention}
                        stage={drefStage}
                    />
                ))}
            </Container>
        </TabPage>
    );
}

Component.displayName = 'EmergencyOperationStrategy';
