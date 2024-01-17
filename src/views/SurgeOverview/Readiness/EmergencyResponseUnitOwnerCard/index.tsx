import { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import RawList from '#components/RawList';
import Link from '#components/Link';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import { type GoApiResponse } from '#utils/restRequest';
import { resolveToString } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetERUOwnersResponse = GoApiResponse<'/api/v2/eru_owner/'>;
type ERUOwnerListItem = NonNullable<GetERUOwnersResponse['results']>[number];

const emergencyResponseUnitKeySelector = (item: ERUOwnerListItem['eru'][number]) => item.id;

interface Props {
    className?: string;
    data: ERUOwnerListItem;
}

function EmergencyResponseUnitOwnerCard(props: Props) {
    const {
        className,
        data: {
            national_society_country,
            eru,
            updated_at,
        },
    } = props;

    const strings = useTranslation(i18n);
    const readyEmergencyResponseUnits = eru.filter((e) => e.available);
    const deployedEmergencyResponseUnits = eru.filter((e) => e.deployed_to);

    const rendererParams = useCallback(
        (_: number, e: NonNullable<ERUOwnerListItem['eru']>[number]) => ({
            value: e.units,
            label: e.type_display,
            strongValue: true,
            withoutLabelColon: true,
            className: styles.textOutput,
            labelClassName: styles.label,
        }),
        [],
    );

    const rendererDeployedParams = useCallback(
        (_: number, e: NonNullable<ERUOwnerListItem['eru']>[number]) => ({
            value: (
                <Link
                    to="countriesLayout"
                    urlParams={{ countryId: e.deployed_to.id }}
                    withUnderline
                >
                    {e.deployed_to.name}
                </Link>
            ),
            label: e.type_display,
            labelClassName: styles.label,
            strongValue: true,
        }),
        [],
    );

    return (
        <Container
            className={_cs(styles.emergencyResponseUnitOwnerCard, className)}
            withInternalPadding
            withHeaderBorder
            spacing="default"
            heading={(
                <Link
                    to="countriesLayout"
                    urlParams={{ countryId: national_society_country.id }}
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
            <Container
                className={styles.figure}
                heading={resolveToString(
                    strings.emergencyResponseUnitOwnerCardReady,
                    { count: readyEmergencyResponseUnits.length },
                )}
                headingLevel={4}
                spacing="cozy"
                childrenContainerClassName={styles.content}
            >
                <RawList
                    data={readyEmergencyResponseUnits}
                    keySelector={emergencyResponseUnitKeySelector}
                    renderer={TextOutput}
                    rendererParams={rendererParams}
                />
            </Container>
            <div className={styles.separator} />
            <Container
                className={styles.figure}
                childrenContainerClassName={styles.content}
                heading={resolveToString(
                    strings.emergencyResponseUnitOwnerCardDeployed,
                    { count: deployedEmergencyResponseUnits.length },
                )}
                headingLevel={4}
                spacing="cozy"
            >
                {deployedEmergencyResponseUnits.length > 0 && (
                    <RawList
                        data={deployedEmergencyResponseUnits}
                        keySelector={emergencyResponseUnitKeySelector}
                        renderer={TextOutput}
                        rendererParams={rendererDeployedParams}
                    />
                )}
            </Container>
        </Container>
    );
}

export default EmergencyResponseUnitOwnerCard;
