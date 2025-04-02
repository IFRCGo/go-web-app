import {
    useCallback,
    useMemo,
} from 'react';
import {
    Container,
    KeyFigure,
    ReducedListDisplay,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    getDuration,
    maxSafe,
    minSafe,
    resolveToComponent,
    stringNameSelector,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    unique,
} from '@togglecorp/fujs';

import DisplayName from '#components/DisplayName';
import SeverityIndicator from '#components/domain/SeverityIndicator';
import Link from '#components/Link';
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
            appeals,
        },
    } = props;

    const strings = useTranslation(i18n);

    const operationStartDate = minSafe(appeals.map(
        (a) => a.start_date,
    ).filter(isDefined).map((d) => new Date(d).getTime()));

    const operationEndDate = maxSafe(appeals.map(
        (a) => a.end_date,
    ).filter(isDefined).map((d) => new Date(d).getTime()));

    const duration = isDefined(operationStartDate) && isDefined(operationEndDate)
        ? getDuration(new Date(operationStartDate), new Date(operationEndDate)) : undefined;

    const deployedERUTypes = useMemo(() => (
        unique(erus
            .map((eru) => eru.type_display)
            .filter(isDefined)
            .map((eruType) => ({ name: eruType })))
    ), [erus]);

    const personnel = useMemo(() => (
        deployments.flatMap((deployment) => deployment.personnel)
    ), [deployments]);

    const deployedPersonnelTypes = useMemo(() => (
        unique(personnel
            .map((person) => person.role)
            .filter(isDefined)
            .map((role) => ({ name: role })))
    ), [personnel]);

    const eruDeployingOrganizations = useMemo(() => (
        unique(erus
            .map((eru) => eru.eru_owner_details.national_society_country_details.society_name)
            .filter(isDefined)
            .map((nationalSociety) => ({ name: nationalSociety })))
    ), [erus]);

    const personnelDeployingOrganizations = useMemo(() => (
        unique(personnel
            .map((person) => (person.country_from.society_name))
            .filter(isDefined)
            .map((nationalSociety) => ({ name: nationalSociety })))
    ), [personnel]);

    const rendererParams = useCallback(
        (value: { name: string }) => ({
            name: value.name,
        }),
        [],
    );

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
            headerDescriptionContainerClassName={styles.headerDescription}
            headerDescription={resolveToComponent(
                strings.operationTimeline,
                {
                    startDate: (
                        <TextOutput
                            value={operationStartDate}
                            label={strings.operationStartDate}
                            valueType="date"
                        />
                    ),
                    duration,
                },
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
                    className={styles.surge}
                    childrenContainerClassName={styles.figures}
                    footerContent={(
                        <TextOutput
                            value={(
                                <ReducedListDisplay
                                    list={eruDeployingOrganizations}
                                    keySelector={stringNameSelector}
                                    renderer={DisplayName}
                                    rendererParams={rendererParams}
                                    maxItems={3}
                                />
                            )}
                            label={strings.surgeDeployingOrganizations}
                            strongValue
                            withoutLabelColon
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
                        label={(
                            <ReducedListDisplay
                                list={deployedERUTypes}
                                keySelector={stringNameSelector}
                                renderer={DisplayName}
                                rendererParams={rendererParams}
                                maxItems={3}
                            />
                        )}
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
                    className={styles.surge}
                    childrenContainerClassName={styles.figures}
                    spacing="cozy"
                    footerClassName={styles.footerContent}
                    footerContent={(
                        <TextOutput
                            value={(
                                <ReducedListDisplay
                                    list={personnelDeployingOrganizations}
                                    keySelector={stringNameSelector}
                                    renderer={DisplayName}
                                    rendererParams={rendererParams}
                                    maxItems={3}
                                />
                            )}
                            label={strings.surgeDeployingOrganizations}
                            strongValue
                            withoutLabelColon
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
                        label={(
                            <ReducedListDisplay
                                list={deployedPersonnelTypes}
                                keySelector={stringNameSelector}
                                renderer={DisplayName}
                                rendererParams={rendererParams}
                                maxItems={3}
                            />
                        )}
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
