import { useMemo } from 'react';
import {
    Container,
    KeyFigure,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    _cs,
    isDefined,
    unique,
} from '@togglecorp/fujs';

import SeverityIndicator from '#components/domain/SeverityIndicator';
import Link from '#components/Link';
import { joinStrings } from '#utils/common';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type AggregatedSurgeResponse = GoApiResponse<'/api/v2/aggregated-eru-and-rapid-response/'>;
type AggregatedSurgeItem = NonNullable<AggregatedSurgeResponse['results']>[number];

interface Props {
    className?: string;
    emergencyId: number;
    surgeItem: AggregatedSurgeItem;
}
function SurgeCard(props: Props) {
    const {
        className,
        emergencyId,
        surgeItem: {
            name: emergencyName,
            ifrc_severity_level: severityLevel,
            deployed_eru_count: deployedERUCount,
            deployed_personnel_count: deployedPersonnelCount,
            deployments,
            erus,
        },
    } = props;

    const strings = useTranslation(i18n);

    const deployedERUTypes = useMemo(() => (
        joinStrings(erus.map((eru) => eru.type_display).filter(isDefined))
    ), [erus]);

    const personnel = useMemo(() => (
        deployments.flatMap((deployment) => deployment.personnel)
    ), [deployments]);

    const deployedPersonnelTypes = useMemo(() => (
        joinStrings(unique(personnel.map((person) => person.role).filter(isDefined)))
    ), [personnel]);

    const eruDeployingOrganizations = useMemo(() => (
        joinStrings(unique(erus.map((eru) => (
            eru.eru_owner_details.national_society_country_details.society_name
        )).filter(isDefined)))
    ), [erus]);

    const personnelDeployingOrganizations = useMemo(() => (
        joinStrings(unique(personnel.map((person) => (
            person.country_from.society_name
        )).filter(isDefined)))
    ), [personnel]);

    return (
        <Container
            className={_cs(styles.surgeCard, className)}
            headingClassName={styles.heading}
            headingContainerClassName={styles.headingContainer}
            heading={(
                <Link
                    to="emergenciesLayout"
                    urlParams={{ emergencyId }}
                    ellipsize
                >
                    {emergencyName}
                </Link>
            )}
            headingLevel={4}
            withInternalPadding
            withHeaderBorder
            withoutWrapInHeading
            icons={severityLevel ? (
                <SeverityIndicator
                    className={styles.severityIndicator}
                    level={severityLevel}
                />
            ) : undefined}
            childrenContainerClassName={styles.figuresContainer}
        >
            {deployedERUCount > 0 && (
                <Container
                    spacing="cozy"
                    childrenContainerClassName={styles.figures}
                    footerContent={(
                        <TextOutput
                            value={eruDeployingOrganizations}
                            label={strings.surgeDeployingOrganizations}
                            strongValue
                            withoutLabelColon
                            valueType="text"
                        />
                    )}
                >
                    <KeyFigure
                        className={styles.figure}
                        value={deployedERUCount}
                        label={strings.surgeEmergencyResponseUnit}
                        compactValue
                    />
                    <div className={styles.separator} />
                    <TextOutput
                        className={styles.figure}
                        labelClassName={styles.label}
                        label={deployedERUTypes}
                        value={strings.surgeDeployedERUs}
                        strongLabel
                        withoutLabelColon
                    />
                </Container>
            )}
            {deployedERUCount > 0 && deployedPersonnelCount > 0 && (
                <div className={styles.separator} />
            )}
            {deployedPersonnelCount > 0 && (
                <Container
                    childrenContainerClassName={styles.figures}
                    spacing="cozy"
                    footerContent={(
                        <TextOutput
                            value={personnelDeployingOrganizations}
                            label={strings.surgeDeployingOrganizations}
                            strongValue
                            withoutLabelColon
                            valueType="text"
                        />
                    )}
                >
                    <KeyFigure
                        className={styles.figure}
                        value={deployedPersonnelCount}
                        label={strings.surgeRapidResponsePersonnel}
                        compactValue
                    />
                    <div className={styles.separator} />
                    <TextOutput
                        className={styles.figure}
                        label={deployedPersonnelTypes}
                        value={strings.surgeDeployedRRs}
                        strongLabel
                        withoutLabelColon
                    />
                </Container>
            )}
        </Container>
    );
}

export default SurgeCard;
