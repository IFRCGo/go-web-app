import { faChevronRight } from '@fortawesome/pro-regular-svg-icons';
import { faLocationCrosshairs } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    NumberOutput,
    RawButton,
} from '@ifrc-go/ui';
import { _cs } from '@togglecorp/fujs';

import useHoverChange from '#hooks/useHoverChange';
import {
    type AdminAreaDrillDownHandler,
    type AdminAreaProperties,
    type PlaceCodeChangeHandler,
} from '#views/CountryProfileNationalRiskWatch/types';

import styles from './styles.module.css';

interface Props {
    adminArea: AdminAreaProperties;
    exposedPopulation: number | undefined;
    color: string;
    hovered: boolean;
    drillable: boolean;
    disabled: boolean;
    onHoverChange: PlaceCodeChangeHandler;
    onDrillDown: AdminAreaDrillDownHandler;
}

function NrwExposedAdminAreaRow(props: Props) {
    const {
        adminArea,
        exposedPopulation,
        color,
        hovered,
        drillable,
        disabled,
        onHoverChange,
        onDrillDown,
    } = props;

    const { handleMouseEnter, handleMouseLeave } = useHoverChange(
        adminArea.placeCode,
        onHoverChange,
    );

    return (
        <tr
            className={_cs(
                styles.nrwExposedAdminAreaRow,
                hovered && styles.hovered,
                drillable && styles.drillable,
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={drillable && !disabled ? () => onDrillDown(adminArea) : undefined}
        >
            <td>
                <span className={styles.adminArea}>
                    <span
                        className={styles.colorDot}
                        style={{ backgroundColor: color }}
                    />
                    {drillable ? (
                        <RawButton
                            className={styles.adminAreaName}
                            name={undefined}
                            disabled={disabled}
                        >
                            {adminArea.name}
                        </RawButton>
                    ) : (
                        <span className={styles.adminAreaName}>
                            {adminArea.name}
                        </span>
                    )}
                </span>
            </td>
            <td>
                <span className={styles.exposedPopulation}>
                    <NumberOutput
                        value={exposedPopulation}
                        invalidText="--"
                    />
                    <FontAwesomeIcon
                        className={styles.hoverIcon}
                        icon={drillable ? faChevronRight : faLocationCrosshairs}
                    />
                </span>
            </td>
        </tr>
    );
}

export default NrwExposedAdminAreaRow;
