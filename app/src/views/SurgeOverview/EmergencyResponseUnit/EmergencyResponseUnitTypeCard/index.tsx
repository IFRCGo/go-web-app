import { AlertCheckLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    Heading,
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

type GetEruReadinessResponse = GoApiResponse<'/api/v2/eru-readiness/'>;
type EruReadinessListItem = NonNullable<GetEruReadinessResponse['results']>[number];

interface NationalSociety {
    name: string;
    ns_funding_readiness: number;
    ns_equipment_readiness: number;
    ns_people_readiness: number;
}

interface Props {
    className?: string;
    typeDisplay: string;
    nationalSocieties?: NationalSociety[];
    fundingReadiness: number;
    equipmentReadiness: number;
    peopleReadiness: number;
    updatedAt?: string;
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
    } = props;

    const strings = useTranslation(i18n);

    const [
        showReadinessInfo,
        {
            setTrue: setShowReadinessInfoTrue,
            setFalse: setShowReadinessInfoFalse,
        },
    ] = useBooleanState(false);

    const getReadinessColor = (rank: number) => {
        if (rank === 1) return styles.greenIcon;
        if (rank === 2) return styles.yellowIcon;
        return styles.redIcon;
    };

    const nationalSocietyList = nationalSocieties?.flatMap((society) => society?.name).join(', ');

    return (
        <Container
            className={_cs(styles.emergencyResponseTypeCard, className)}
            withInternalPadding
            withHeaderBorder
            spacing="default"
            heading={typeDisplay}
            headerDescription={(
                <TextOutput
                    className={styles.lastUpdated}
                    label={strings.emergencyResponseUnitOwnerCardLastUpdated}
                    value={updatedAt}
                    valueType="date"
                />
            )}
            footerContentClassName={styles.readinessList}
            footerContent={(
                <>
                    <div className={styles.separator} />
                    <div className={styles.figures}>
                        <TextOutput
                            className={styles.readiness}
                            label="Equipment Readiness"
                            value={(
                                <AlertCheckLineIcon
                                    className={`${styles.readinessIcon}
                            ${getReadinessColor(equipmentReadiness)}`}
                                />
                            )}
                            withoutLabelColon
                        />
                        <div className={styles.separatorLeft} />
                        <TextOutput
                            className={styles.readiness}
                            label="People Readiness"
                            value={(
                                <AlertCheckLineIcon
                                    className={`${styles.readinessIcon}
                            ${getReadinessColor(peopleReadiness)}`}
                                />
                            )}
                            withoutLabelColon
                        />
                        <div className={styles.separatorLeft} />
                        <TextOutput
                            className={styles.readiness}
                            label="Funding Readiness"
                            value={(
                                <AlertCheckLineIcon
                                    className={`${styles.readinessIcon}
                            ${getReadinessColor(fundingReadiness)}`}
                                />
                            )}
                            withoutLabelColon
                        />
                    </div>
                    <div className={styles.separator} />
                    <Button
                        className={styles.showIcon}
                        name={undefined}
                        onClick={setShowReadinessInfoTrue}
                        variant="tertiary"
                        title="Show Readiness Information"
                    >
                        Show Readiness Information
                    </Button>
                </>
            )}
        >
            <TextOutput
                className={styles.eruOwners}
                label="National Society"
                value={nationalSocietyList}
                strongValue
                withoutLabelColon
            />
            {showReadinessInfo && (
                <Modal
                    modalContainerClassName={styles.modal}
                    heading={typeDisplay}
                    headingDescription="Readiness Information by National Society"
                    onClose={setShowReadinessInfoFalse}
                    withHeaderBorder
                    size="sm"
                    childrenContainerClassName={styles.societyList}
                >
                    {nationalSocieties?.map((society) => (
                        <>
                            <Heading
                                level={5}
                            >
                                {society.name}
                            </Heading>
                            <div className={styles.separator} />
                            <div className={styles.figures}>
                                <TextOutput
                                    className={styles.readiness}
                                    label="Equipment Readiness"
                                    value={(
                                        <AlertCheckLineIcon
                                            className={`${styles.readinessIcon}
                                        ${getReadinessColor(society.ns_equipment_readiness)}`}
                                        />
                                    )}
                                    valueClassName={styles.readinessIcon}
                                    withoutLabelColon
                                />
                                <div className={styles.separatorLeft} />
                                <TextOutput
                                    className={styles.readiness}
                                    label="People Readiness"
                                    value={(
                                        <AlertCheckLineIcon
                                            className={`${styles.readinessIcon}
                                        ${getReadinessColor(society.ns_people_readiness)}`}
                                        />
                                    )}
                                    valueClassName={styles.readinessIcon}
                                    withoutLabelColon
                                />
                                <div className={styles.separatorLeft} />
                                <TextOutput
                                    className={styles.readiness}
                                    label="Funding Readiness"
                                    value={(
                                        <AlertCheckLineIcon
                                            className={`${styles.readinessIcon}
                                        ${getReadinessColor(society.ns_funding_readiness)}`}
                                        />
                                    )}
                                    valueClassName={styles.readinessIcon}
                                    withoutLabelColon
                                />
                            </div>
                            <div className={styles.separator} />
                        </>
                    ))}
                </Modal>
            )}
        </Container>
    );
}

export default EmergencyResponseUnitTypeCard;
