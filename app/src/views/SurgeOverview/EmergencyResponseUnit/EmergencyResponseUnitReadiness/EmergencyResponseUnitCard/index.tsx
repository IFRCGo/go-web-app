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

import {
    NS_CONTRIBUTION_HOLDS_ERU,
    NS_CONTRIBUTION_SUPPORTS_ERU,
} from '#utils/constants';
import { type GoApiResponse } from '#utils/restRequest';

import EruReadinessList from '../EruReadinessList';
import ReadinessIconList from '../ReadinessIconList';

import i18n from './i18n.json';

type EruReadinessTypeResponse = GoApiResponse<'/api/v2/eru-readiness-type/'>;

export type ReadinessList = Array<NonNullable<NonNullable<EruReadinessTypeResponse['results']>[number]> & {
    eruOwner: NonNullable<NonNullable<NonNullable<EruReadinessTypeResponse['results']>[number]>['eru_readiness']>[number]['eru_owner_details'];
    updatedAt: NonNullable<NonNullable<NonNullable<EruReadinessTypeResponse['results']>[number]>['eru_readiness']>[number]['updated_at'];
}>

interface Props {
    className?: string;
    typeDisplay: string;
    nationalSocieties: string;
    fundingReadiness: number | undefined;
    equipmentReadiness: number | undefined;
    peopleReadiness: number | undefined;
    updatedAt: number | undefined;
    readinessList: ReadinessList;
}

function EmergencyResponseUnitTypeCard(props: Props) {
    const {
        className,
        typeDisplay,
        nationalSocieties,
        fundingReadiness,
        equipmentReadiness,
        peopleReadiness,
        updatedAt,
        readinessList,
    } = props;

    const strings = useTranslation(i18n);

    const groupedByNsContribution = useMemo(() => (
        listToGroupList(
            readinessList,
            (eru) => eru.ns_contribution,
        )
    ), [readinessList]);

    const [
        showReadinessInfo,
        {
            setTrue: setShowReadinessInfoTrue,
            setFalse: setShowReadinessInfoFalse,
        },
    ] = useBooleanState(false);

    return (
        <Container
            className={className}
            withHeaderBorder
            heading={typeDisplay}
            headingLevel={4}
            headerDescription={(
                <TextOutput
                    label={strings.emergencyResponseUnitOwnerCardLastUpdated}
                    value={updatedAt}
                    valueType="date"
                    textSize="sm"
                />
            )}
            withFooterBorder
            footerActions={(
                <Button
                    name={undefined}
                    onClick={setShowReadinessInfoTrue}
                    styleVariant="action"
                    title={strings.eruSeeReadinessInfoButton}
                >
                    {strings.eruSeeReadinessInfoButton}
                </Button>
            )}
            withPadding
            withBackground
            withShadow
        >
            <ListView layout="block">
                <TextOutput
                    label={strings.emergencyResponseUnitNationalSociety}
                    value={nationalSocieties}
                    strongValue
                />
                <ListView
                    layout="grid"
                    numPreferredGridColumns={3}
                    minGridColumnSize="6rem"
                >
                    <ReadinessIconList
                        fundingReadiness={fundingReadiness}
                        equipmentReadiness={equipmentReadiness}
                        peopleReadiness={peopleReadiness}
                    />
                </ListView>
            </ListView>
            {showReadinessInfo && (
                <Modal
                    heading={typeDisplay}
                    headerDescription={strings.eruReadinessInformationHeading}
                    onClose={setShowReadinessInfoFalse}
                    size="md"
                    withoutSpacingOpticalCorrection
                >
                    {isNotDefined(groupedByNsContribution)
                        && (strings.eruReadinessNoData)}
                    {isDefined(groupedByNsContribution) && (
                        <ListView
                            layout="block"
                        >
                            {isDefined(groupedByNsContribution[NS_CONTRIBUTION_HOLDS_ERU]) && (
                                <Container
                                    headingLevel={5}
                                    heading={strings.eruHoldingERUTitle}
                                >
                                    <ListView
                                        layout="block"
                                        spacing="2xs"
                                    >
                                        {groupedByNsContribution[NS_CONTRIBUTION_HOLDS_ERU]
                                            ?.map((readiness) => (
                                                <EruReadinessList
                                                    key={readiness.id}
                                                    heading={readiness.eruOwner
                                                        .national_society_country_details
                                                        .society_name}
                                                    fundingReadiness={readiness.funding_readiness}
                                                    equipmentReadiness={readiness
                                                        .equipment_readiness}
                                                    peopleReadiness={readiness.people_readiness}
                                                />
                                            ))}
                                    </ListView>
                                </Container>
                            )}
                            {isDefined(groupedByNsContribution[NS_CONTRIBUTION_SUPPORTS_ERU]) && (
                                <Container
                                    headingLevel={5}
                                    heading={strings.eruSupportERUTitle}
                                >
                                    <ListView
                                        layout="block"
                                        spacing="2xs"
                                    >
                                        {groupedByNsContribution[NS_CONTRIBUTION_SUPPORTS_ERU]
                                            ?.map((readiness) => (
                                                <EruReadinessList
                                                    key={readiness.id}
                                                    heading={readiness.eruOwner
                                                        .national_society_country_details
                                                        .society_name}
                                                    fundingReadiness={readiness.funding_readiness}
                                                    equipmentReadiness={readiness
                                                        .equipment_readiness}
                                                    peopleReadiness={readiness.people_readiness}
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

export default EmergencyResponseUnitTypeCard;
