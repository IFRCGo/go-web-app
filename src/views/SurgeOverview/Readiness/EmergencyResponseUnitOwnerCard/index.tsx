import { useCallback, useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import { generatePath } from 'react-router-dom';

import List from '#components/List';
import Link from '#components/Link';
import Header from '#components/Header';
import TextOutput from '#components/TextOutput';
import Heading from '#components/Heading';
import { paths } from '#generated/types';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import { resolveToString } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetERUOwners = paths['/api/v2/eru_owner/']['get'];
type GetERUOwnersResponse = GetERUOwners['responses']['200']['content']['application/json'];
type ERUOwnerListItem = NonNullable<GetERUOwnersResponse['results']>[number];

const emergencyResponseUnitKeySelector = (item: ERUOwnerListItem['eru_set'][number]) => item.id;

interface Props {
    className?: string;
    data: ERUOwnerListItem;
}

function EmergencyResponseUnitOwnerCard(props: Props) {
    const {
        className,
        data: {
            national_society_country,
            eru_set,
            updated_at,
        },
    } = props;

    const {
        country: countryRoute,
    } = useContext(RouteContext);

    const strings = useTranslation(i18n);
    const readyEmergencyResponseUnits = eru_set.filter((eru) => eru.available);
    const deployedEmergencyResponseUnits = eru_set?.filter((eru) => eru.deployed_to);

    const rendererParams = useCallback(
        (_: number, eru: NonNullable<ERUOwnerListItem['eru_set']>[number]) => ({
            value: eru.units,
            label: eru.type_display,
            strongValue: true,
            withoutLabelColon: true,
        }),
        [],
    );

    const rendererDeployedParams = useCallback(
        (_: number, eru: NonNullable<ERUOwnerListItem['eru_set']>[number]) => ({
            value: (
                <Link
                    to={generatePath(
                        countryRoute.absolutePath,
                        { countryId: eru.deployed_to.id },
                    )}
                >
                    {eru.deployed_to.name}
                </Link>
            ),
            label: eru.type_display,
            strongValue: true,
            withoutLabelColon: true,
        }),
        [countryRoute],
    );

    return (
        <div className={_cs(styles.emergencyResponseUnitOwnerCard, className)}>
            <Header
                className={styles.header}
                heading={(
                    <Link
                        to={generatePath(
                            countryRoute.absolutePath,
                            { countryId: national_society_country.id },
                        )}
                    >
                        {national_society_country.society_name}
                    </Link>
                )}
                headingLevel={4}
                actions={(
                    <div className={styles.lastUpdated}>
                        <div className={styles.label}>
                            {strings.emergencyResponseUnitOwnerCardLastUpdated}
                        </div>
                        <TextOutput
                            value={updated_at}
                            valueType="date"
                        />
                    </div>
                )}
            />
            <div className={styles.divider} />
            <div className={styles.figures}>
                <div className={styles.figure}>
                    <Heading level={5} className={styles.heading}>
                        {resolveToString(
                            strings.emergencyResponseUnitOwnerCardReady,
                            { count: readyEmergencyResponseUnits.length },
                        )}
                    </Heading>
                    {readyEmergencyResponseUnits.length > 0 && (
                        <List
                            data={readyEmergencyResponseUnits}
                            keySelector={emergencyResponseUnitKeySelector}
                            renderer={TextOutput}
                            errored={false}
                            pending={false}
                            filtered={false}
                            rendererParams={rendererParams}
                        />
                    )}
                </div>
                <div className={styles.separator} />
                <div className={styles.figure}>
                    <Heading level={5} className={styles.heading}>
                        {resolveToString(
                            strings.emergencyResponseUnitOwnerCardDeployed,
                            { count: deployedEmergencyResponseUnits.length },
                        )}
                    </Heading>
                    {deployedEmergencyResponseUnits.length > 0 && (
                        <List
                            data={deployedEmergencyResponseUnits}
                            keySelector={emergencyResponseUnitKeySelector}
                            renderer={TextOutput}
                            errored={false}
                            pending={false}
                            filtered={false}
                            rendererParams={rendererDeployedParams}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default EmergencyResponseUnitOwnerCard;
