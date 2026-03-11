import { useMemo } from 'react';
import {
    Button,
    Container,
    ListView,
    Modal,
    TextOutput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
} from '@togglecorp/fujs';

import { joinStrings } from '#utils/common';
import {
    NS_CONTRIBUTION_HOLDS_ERU,
    NS_CONTRIBUTION_SUPPORTS_ERU,
} from '#utils/constants';
import { type GoApiResponse } from '#utils/restRequest';

import EruReadinessList from '../EruReadinessList';

import i18n from './i18n.json';

type GetEruReadinessResponse = GoApiResponse<'/api/v2/eru-readiness/'>;
type EruReadinessListItem = NonNullable<GetEruReadinessResponse['results']>[number];

interface Props {
    className?: string;
    eruData: EruReadinessListItem;
}

function NationalSocietyCard(props: Props) {
    const {
        className,
        eruData,
    } = props;

    const strings = useTranslation(i18n);

    const [
        showReadinessInfo,
        {
            setTrue: setShowReadinessInfoTrue,
            setFalse: setShowReadinessInfoFalse,
        },
    ] = useBooleanState(false);

    const eruTypes = joinStrings(eruData.eru_types.map((eruType) => eruType.type_display));

    const groupedByNsContribution = useMemo(() => (
        listToGroupList(
            eruData.eru_types,
            (eru) => eru.ns_contribution,
        )
    ), [eruData]);

    return (
        <Container
            className={className}
            withHeaderBorder
            withFooterBorder
            heading={eruData?.eru_owner_details?.national_society_country_details?.society_name ?? '??'}
            headerDescription={(
                <TextOutput
                    label={strings.emergencyResponseUnitOwnerNSCardLastUpdated}
                    value={eruData.updated_at}
                    valueType="date"
                    textSize="sm"
                />
            )}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={setShowReadinessInfoTrue}
                    styleVariant="action"
                    title={strings.eruNSSeeReadinessInfoButton}
                >
                    {strings.eruNSSeeReadinessInfoButton}
                </Button>
            )}
            withPadding
            withShadow
            withBackground
        >
            <TextOutput
                label={strings.eruTypesLabel}
                value={eruTypes}
                strongValue
            />
            {showReadinessInfo && (
                <Modal
                    heading={
                        eruData.eru_owner_details.national_society_country_details.society_name
                    }
                    headerDescription={strings.eruNSReadinessInformationHeading}
                    onClose={setShowReadinessInfoFalse}
                    size="md"
                    withContentWell
                    withoutSpacingOpticalCorrection
                >
                    {isNotDefined(groupedByNsContribution)
                        && (strings.nationalReadinessNoData)}
                    {isDefined(groupedByNsContribution) && (
                        <ListView layout="block">
                            {isDefined(groupedByNsContribution[NS_CONTRIBUTION_HOLDS_ERU]) && (
                                <Container
                                    headingLevel={5}
                                    heading={strings.emergencyHoldingERUTitle}
                                >
                                    <ListView
                                        layout="block"
                                        spacing="2xs"
                                    >
                                        {groupedByNsContribution[NS_CONTRIBUTION_HOLDS_ERU]
                                            ?.map((eruType) => (
                                                <EruReadinessList
                                                    key={eruType.id}
                                                    heading={eruType.type_display}
                                                    fundingReadiness={eruType.funding_readiness}
                                                    equipmentReadiness={eruType.equipment_readiness}
                                                    peopleReadiness={eruType.people_readiness}
                                                />
                                            ))}
                                    </ListView>
                                </Container>
                            )}
                            {isDefined(groupedByNsContribution[NS_CONTRIBUTION_SUPPORTS_ERU]) && (
                                <Container
                                    headingLevel={5}
                                    heading={strings.emergencySupportERUTitle}
                                >
                                    <ListView
                                        layout="block"
                                        spacing="2xs"
                                    >
                                        {groupedByNsContribution[NS_CONTRIBUTION_SUPPORTS_ERU]
                                            ?.map((eruType) => (
                                                <EruReadinessList
                                                    key={eruType.id}
                                                    heading={eruType.type_display}
                                                    fundingReadiness={eruType.funding_readiness}
                                                    equipmentReadiness={eruType.equipment_readiness}
                                                    peopleReadiness={eruType.people_readiness}
                                                />
                                            ))}
                                    </ListView>
                                </Container>
                            )}
                        </ListView>
                    )}
                </Modal>
            )}
        </Container>
    );
}

export default NationalSocietyCard;
