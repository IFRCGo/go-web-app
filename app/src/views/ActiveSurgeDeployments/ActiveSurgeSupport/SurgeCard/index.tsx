import {
    useCallback,
    useMemo,
} from 'react';
import {
    Container,
    DateOutput,
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
            .map((eru) => eru.eru_owner_details.national_society_country_details?.society_name)
            .filter(isDefined)
            .map((nationalSociety) => ({ name: nationalSociety })))
    ), [erus]);

    const personnelDeployingOrganizations = useMemo(() => (
        unique(personnel
            .map((person) => (person.country_from?.society_name))
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
            headingLevel={4}
            withInternalPadding
            withHeaderBorder
            withoutWrapInHeading
            ellipsizeHeading
            heading={(
                <Link
                    to="emergenciesLayout"
                    urlParams={{ emergencyId }}
                    ellipsize
                >
                    {emergencyName}
                </Link>
            )}
            headerDescription={resolveToComponent(
                strings.operationTimeline,
                {
                    startDate: (
                        <DateOutput
                            value={operationStartDate}
                        />
                    ),
                    duration,
                },
            )}
            icons={severityLevel ? (
                <SeverityIndicator
                    className={styles.severityIndicator}
                    level={severityLevel}
                />
            ) : undefined}
            childrenContainerClassName={styles.content}
        >
            {deployedERUCount > 0 && (
                <>
                    <KeyFigure
                        className={styles.figure}
                        value={deployedERUCount}
                        label={strings.surgeEmergencyResponseUnit}
                        compactValue
                    />
                    <div className={styles.verticalSeparator} />
                    <ReducedListDisplay
                        list={deployedERUTypes}
                        keySelector={stringNameSelector}
                        renderer={DisplayName}
                        rendererParams={rendererParams}
                        maxItems={3}
                    />
                    <TextOutput
                        className={styles.deployingOrganizations}
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
                    />
                </>
            )}
            {deployedERUCount > 0 && deployedPersonnelCount > 0 && (
                <div className={styles.separator} />
            )}
            {deployedPersonnelCount > 0 && (
                <>
                    <KeyFigure
                        className={styles.figure}
                        value={deployedPersonnelCount}
                        label={strings.surgeRapidResponsePersonnel}
                        compactValue
                    />
                    <div className={styles.verticalSeparator} />
                    <ReducedListDisplay
                        list={deployedPersonnelTypes}
                        keySelector={stringNameSelector}
                        renderer={DisplayName}
                        rendererParams={rendererParams}
                        maxItems={3}
                    />
                    <TextOutput
                        className={styles.deployingOrganizations}
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
                    />
                </>
            )}
        </Container>
    );
}

export default SurgeCard;
