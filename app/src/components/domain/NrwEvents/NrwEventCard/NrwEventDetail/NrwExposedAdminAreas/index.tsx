import {
    useContext,
    useMemo,
} from 'react';
import { faLocationDot } from '@fortawesome/pro-regular-svg-icons';
import {
    faLocationCrosshairs,
    faPersonRays,
} from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NumberOutput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isNotDefined,
    sum,
} from '@togglecorp/fujs';

import {
    alertClassMapRamps,
    getEqualIntervalBreaks,
    getRampColor,
} from '#utils/nrw/colors';
import { getNrwExposedPopulationByPlaceCode } from '#utils/nrw/events';
import NrwAdminAreasContext from '#views/CountryProfileNationalRiskWatch/NrwAdminAreasProvider/NrwAdminAreasContext';
import {
    type NrwAdminAreaFeatureCollection,
    type NrwEvent,
} from '#views/CountryProfileNationalRiskWatch/types';
import { parseAdminAreaProperties } from '#views/CountryProfileNationalRiskWatch/utils';

import NrwExposedAdminAreaRow from './NrwExposedAdminAreaRow';

import i18n from './i18n.json';
import styles from './styles.module.css';

// The rows of the table, most exposed first, coloured as their map polygons.
function getExposedAdminAreaRows(adminAreas: NrwAdminAreaFeatureCollection, event: NrwEvent) {
    const exposedPopulationByPlaceCode = getNrwExposedPopulationByPlaceCode(event);
    const rows = adminAreas.features
        .map((feature) => parseAdminAreaProperties(feature.properties))
        .filter(isDefined)
        .map((adminArea) => ({
            adminArea,
            exposedPopulation: exposedPopulationByPlaceCode.get(adminArea.placeCode),
        }))
        .sort((a, b) => (b.exposedPopulation ?? 0) - (a.exposedPopulation ?? 0));

    const breaks = getEqualIntervalBreaks(
        rows.map((row) => row.exposedPopulation).filter(isDefined),
    );
    const ramp = alertClassMapRamps[event.alertClass];

    return rows.map((row) => ({
        ...row,
        color: getRampColor(ramp, breaks, row.exposedPopulation),
    }));
}

interface Props {
    className?: string;
    event: NrwEvent;
}

function NrwExposedAdminAreas(props: Props) {
    const { className, event } = props;

    const strings = useTranslation(i18n);
    const {
        adminLevel,
        adminLevelLabels,
        adminAreas,
        pending,
        parentAdminArea,
        hoveredPlaceCode,
        onAdminAreaHoverChange,
        canDrillDown,
        drillDown,
    } = useContext(NrwAdminAreasContext);

    const adminAreaLabel = adminLevelLabels?.[adminLevel]?.plural
        ?? strings.nrwExposedAdminAreasFallbackLabel;

    const rows = useMemo(
        () => (isDefined(adminAreas) ? getExposedAdminAreaRows(adminAreas, event) : []),
        [adminAreas, event],
    );
    const totalExposedPopulation = sum(rows.map((row) => row.exposedPopulation ?? 0));

    if (isNotDefined(adminAreas) && pending) {
        return (
            <div className={_cs(styles.nrwExposedAdminAreas, styles.message, className)}>
                {resolveToString(strings.nrwExposedAdminAreasPendingMessage, { adminAreaLabel })}
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className={_cs(styles.nrwExposedAdminAreas, styles.message, className)}>
                {resolveToString(strings.nrwExposedAdminAreasEmptyMessage, { adminAreaLabel })}
            </div>
        );
    }

    const parentAdminAreaLabel = isDefined(parentAdminArea)
        ? adminLevelLabels?.[parentAdminArea.adminLevel]?.singular
        : undefined;

    return (
        <div className={_cs(styles.nrwExposedAdminAreas, className)}>
            {isDefined(parentAdminArea) && (
                <div className={styles.selectedAdminArea}>
                    <FontAwesomeIcon icon={faLocationCrosshairs} />
                    {strings.nrwExposedAdminAreasSelectedAreaLabel}
                    <span className={styles.selectedAdminAreaValue}>
                        {isDefined(parentAdminAreaLabel)
                            ? resolveToString(
                                strings.nrwExposedAdminAreasSelectedAreaValue,
                                {
                                    name: parentAdminArea.name,
                                    adminAreaLabel: parentAdminAreaLabel,
                                },
                            )
                            : parentAdminArea.name}
                    </span>
                </div>
            )}
            <div className={styles.exposedAdminAreaTotals}>
                <div>
                    {resolveToString(
                        strings.nrwExposedAdminAreasTotalAreas,
                        { adminAreaLabel: adminAreaLabel.toLowerCase() },
                    )}
                    <NumberOutput
                        className={styles.exposedAdminAreaTotalValue}
                        value={rows.length}
                    />
                </div>
                <div>
                    {strings.nrwExposedAdminAreasTotalPopulation}
                    <NumberOutput
                        className={styles.exposedAdminAreaTotalValue}
                        value={totalExposedPopulation}
                        invalidText="--"
                    />
                </div>
            </div>
            <table className={styles.exposedAdminAreasTable}>
                <thead>
                    <tr>
                        <th>
                            <span className={styles.columnHeading}>
                                <FontAwesomeIcon icon={faLocationDot} />
                                {resolveToString(
                                    strings.nrwExposedAdminAreasAreaColumn,
                                    { adminAreaLabel },
                                )}
                            </span>
                        </th>
                        <th>
                            <span className={styles.columnHeading}>
                                <FontAwesomeIcon icon={faPersonRays} />
                                {strings.nrwExposedAdminAreasPopulationColumn}
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(({ adminArea, exposedPopulation, color }) => (
                        <NrwExposedAdminAreaRow
                            key={adminArea.placeCode}
                            adminArea={adminArea}
                            exposedPopulation={exposedPopulation}
                            color={color}
                            hovered={hoveredPlaceCode === adminArea.placeCode}
                            drillable={canDrillDown(adminArea.placeCode)}
                            disabled={pending}
                            onHoverChange={onAdminAreaHoverChange}
                            onDrillDown={drillDown}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default NrwExposedAdminAreas;
