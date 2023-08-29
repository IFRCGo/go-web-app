import { useOutletContext } from 'react-router-dom';
import useTranslation from '#hooks/useTranslation';
import { isDefined } from '@togglecorp/fujs';

import KeyFigure from '#components/KeyFigure';
import TextOutput from '#components/TextOutput';
import Container from '#components/Container';
import type { EmergencyOutletContext } from '#utils/outletContext';
import useDisasterType from '#hooks/domain/useDisasterType';
import SeverityIndicator from '#components/domain/SeverityIndicator';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const disasterTypes = useDisasterType();
    const { emergencyResponse } = useOutletContext<EmergencyOutletContext>();

    const hasKeyFigures = isDefined(emergencyResponse)
                       && emergencyResponse.key_figures.length !== 0;

    const disasterType = disasterTypes?.find(
        (typeOfDisaster) => typeOfDisaster.id === emergencyResponse?.dtype,
    );

    const mdrCode = isDefined(emergencyResponse)
        && isDefined(emergencyResponse?.appeals)
        && emergencyResponse.appeals.length > 0
        ? emergencyResponse?.appeals[0].code : undefined;

    const hasFieldReports = isDefined(emergencyResponse)
        && isDefined(emergencyResponse?.field_reports)
        && emergencyResponse?.field_reports.length > 0;

    const firstFieldReport = hasFieldReports ? emergencyResponse.field_reports[0] : undefined;
    const assistanceIsRequestedByNS = firstFieldReport?.ns_request_assistance;
    const assistanceIsRequestedByCountry = firstFieldReport?.request_assistance;

    return (
        <div className={styles.emergencyDetails}>
            {hasKeyFigures && (
                <Container
                    heading={strings.emergencyKeyFiguresTitle}
                    childrenContainerClassName={styles.keyFigureList}
                    withHeaderBorder
                >
                    {emergencyResponse?.key_figures.map(
                        (keyFigure) => (
                            <KeyFigure
                                key={keyFigure.id}
                                className={styles.keyFigure}
                                // FIXME: get numeric value from server
                                value={Number.parseFloat(keyFigure.number)}
                                description={keyFigure.deck}
                            >
                                <TextOutput
                                    label={strings.emergencyKeyFigureSource}
                                    value={keyFigure.source}
                                />
                            </KeyFigure>
                        ),
                    )}
                </Container>
            )}
            <Container
                heading={strings.emergencyOverviewTitle}
                withHeaderBorder
                childrenContainerClassName={styles.overviewContainer}
            >
                <div className={styles.overview}>
                    <TextOutput
                        label={strings.disasterCategorization}
                        value={emergencyResponse?.ifrc_severity_level_display}
                        description={(
                            <SeverityIndicator
                                level={isDefined(emergencyResponse?.ifrc_severity_level)
                                    ? Number(emergencyResponse?.ifrc_severity_level) : null}
                            />
                        )}
                        strongValue
                    />
                    <TextOutput
                        label={strings.disasterType}
                        value={disasterType?.name}
                        strongValue
                    />
                    <TextOutput
                        label={strings.GLIDENumber}
                        value={emergencyResponse?.glide}
                        strongValue
                    />
                    <TextOutput
                        label={strings.startDate}
                        valueType="date"
                        value={emergencyResponse?.disaster_start_date}
                        strongValue
                    />
                </div>
                <div className={styles.overview}>
                    <TextOutput
                        label={strings.visibility}
                        value={emergencyResponse?.visibility}
                        strongValue
                    />
                    <TextOutput
                        label={strings.MDRCode}
                        value={mdrCode}
                        strongValue
                    />
                    <TextOutput
                        label={strings.assisanceRequestedByNS}
                        valueType="boolean"
                        value={assistanceIsRequestedByNS}
                        strongValue
                    />
                    <TextOutput
                        label={strings.assisanceRequestedByGovernment}
                        valueType="boolean"
                        value={assistanceIsRequestedByCountry}
                        strongValue
                    />
                </div>
            </Container>
        </div>
    );
}

Component.displayName = 'EmergencyDetails';
