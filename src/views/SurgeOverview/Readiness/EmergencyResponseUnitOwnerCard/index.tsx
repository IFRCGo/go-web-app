import { useCallback, useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import { generatePath } from 'react-router-dom';

import Container from '#components/Container';
import List from '#components/List';
import Link from '#components/Link';
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
                    withUnderline
                >
                    {eru.deployed_to.name}
                </Link>
            ),
            label: eru.type_display,
            strongValue: true,
        }),
        [countryRoute],
    );

    return (
        <Container
            className={_cs(styles.emergencyResponseUnitOwnerCard, className)}
            withInternalPadding
            withHeaderBorder
            spacing="relaxed"
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
            headerDescription={(
                <TextOutput
                    className={styles.lastUpdated}
                    label={strings.emergencyResponseUnitOwnerCardLastUpdated}
                    value={updated_at}
                    valueType="date"
                />
            )}
            childrenContainerClassName={styles.figures}
        >
            <div className={styles.figure}>
                <Heading
                    level={4}
                    className={styles.heading}
                >
                    {resolveToString(
                        strings.emergencyResponseUnitOwnerCardReady,
                        { count: readyEmergencyResponseUnits.length },
                    )}
                </Heading>
                {readyEmergencyResponseUnits.length > 0 && (
                    <List
                        className={styles.list}
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
                <Heading
                    level={4}
                    className={styles.heading}
                >
                    {resolveToString(
                        strings.emergencyResponseUnitOwnerCardDeployed,
                        { count: deployedEmergencyResponseUnits.length },
                    )}
                </Heading>
                {deployedEmergencyResponseUnits.length > 0 && (
                    <List
                        className={styles.list}
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
        </Container>
    );
}

export default EmergencyResponseUnitOwnerCard;
