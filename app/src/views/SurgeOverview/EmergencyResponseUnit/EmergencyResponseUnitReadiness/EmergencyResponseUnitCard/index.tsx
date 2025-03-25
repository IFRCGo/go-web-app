import { CheckboxCircleLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    Modal,
    TextOutput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { _cs } from '@togglecorp/fujs';

import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

function getReadinessColor(rank: number | undefined) {
    if (rank === 1) return styles.greenIcon;
    if (rank === 2) return styles.yellowIcon;
    if (rank === 3) return styles.redIcon;
    return styles.grayIcon;
}

type GetEruReadinessResponse = GoApiResponse<'/api/v2/eru-readiness-type/'>;

export type ReadinessList = Array<NonNullable<NonNullable<GetEruReadinessResponse['results']>[0]> & {
    eruOwner: NonNullable<NonNullable<NonNullable<GetEruReadinessResponse['results']>[0]>['eru_readiness']>[0]['eru_owner_details'];
    updatedAt: NonNullable<NonNullable<NonNullable<GetEruReadinessResponse['results']>[0]>['eru_readiness']>[0]['updated_at'];
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

    const [
        showReadinessInfo,
        {
            setTrue: setShowReadinessInfoTrue,
            setFalse: setShowReadinessInfoFalse,
        },
    ] = useBooleanState(false);

    return (
        <Container
            className={_cs(styles.emergencyResponseTypeCard, className)}
            withInternalPadding
            withHeaderBorder
            heading={typeDisplay}
            headerDescription={(
                <TextOutput
                    className={styles.lastUpdated}
                    label={strings.emergencyResponseUnitOwnerCardLastUpdated}
                    value={updatedAt}
                    valueType="date"
                />
            )}
            withFooterBorder
            footerActions={(
                <Button
                    name={undefined}
                    onClick={setShowReadinessInfoTrue}
                    variant="tertiary"
                    title={strings.eruSeeReadinessInfoButton}
                >
                    {strings.eruSeeReadinessInfoButton}
                </Button>
            )}
            childrenContainerClassName={styles.content}
        >
            <Container
                footerContentClassName={styles.readinessContent}
                withFooterBorder
                footerContent={(
                    <>
                        <TextOutput
                            className={styles.readiness}
                            label={strings.eruEquipmentReadiness}
                            value={(
                                <CheckboxCircleLineIcon
                                    className={getReadinessColor(equipmentReadiness)}
                                />
                            )}
                            valueClassName={styles.icon}
                            withoutLabelColon
                        />
                        <div className={styles.separatorLeft} />
                        <TextOutput
                            className={styles.readiness}
                            label={strings.eruPeopleReadiness}
                            value={(
                                <CheckboxCircleLineIcon
                                    className={getReadinessColor(peopleReadiness)}
                                />
                            )}
                            valueClassName={styles.icon}
                            withoutLabelColon
                        />
                        <div className={styles.separatorLeft} />
                        <TextOutput
                            className={styles.readiness}
                            label={strings.eruFundingReadiness}
                            value={(
                                <CheckboxCircleLineIcon
                                    className={getReadinessColor(fundingReadiness)}
                                />
                            )}
                            valueClassName={styles.icon}
                            withoutLabelColon
                        />
                    </>
                )}
            >
                <TextOutput
                    className={styles.eruOwners}
                    label={strings.emergencyResponseUnitNationalSociety}
                    value={nationalSocieties}
                    strongValue
                    withoutLabelColon
                />
            </Container>
            {showReadinessInfo && (
                <Modal
                    className={styles.modal}
                    heading={typeDisplay}
                    headerDescription={strings.eruReadinessInformationHeading}
                    onClose={setShowReadinessInfoFalse}
                    withHeaderBorder
                    size="md"
                    contentViewType="vertical"
                    spacing="comfortable"
                    childrenContainerClassName={styles.content}
                >
                    {readinessList?.map((readiness) => (
                        <Container
                            key={readiness.id}
                            heading={
                                readiness.eruOwner.national_society_country_details.society_name
                            }
                            headingLevel={5}
                            withHeaderBorder
                            childrenContainerClassName={styles.readinessContainer}
                        >
                            <TextOutput
                                className={styles.readiness}
                                label={strings.eruEquipmentReadiness}
                                value={(
                                    <CheckboxCircleLineIcon
                                        className={getReadinessColor(readiness.equipment_readiness)}
                                    />
                                )}
                                valueClassName={styles.icon}
                                withoutLabelColon
                            />
                            <div className={styles.separatorLeft} />
                            <TextOutput
                                className={styles.readiness}
                                label={strings.eruPeopleReadiness}
                                value={(
                                    <CheckboxCircleLineIcon
                                        className={getReadinessColor(readiness.people_readiness)}
                                    />
                                )}
                                valueClassName={styles.icon}
                                withoutLabelColon
                            />
                            <div className={styles.separatorLeft} />
                            <TextOutput
                                className={styles.readiness}
                                label={strings.eruFundingReadiness}
                                value={(
                                    <CheckboxCircleLineIcon
                                        className={getReadinessColor(readiness.funding_readiness)}
                                    />
                                )}
                                valueClassName={styles.icon}
                                withoutLabelColon
                            />
                        </Container>
                    ))}
                </Modal>
            )}
        </Container>
    );
}

export default EmergencyResponseUnitTypeCard;
