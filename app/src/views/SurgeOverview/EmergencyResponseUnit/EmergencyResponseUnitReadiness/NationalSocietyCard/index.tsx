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

import { joinStrings } from '#utils/common';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetEruReadinessResponse = GoApiResponse<'/api/v2/eru-readiness/'>;
type EruReadinessListItem = NonNullable<GetEruReadinessResponse['results']>[number];

function getReadinessColor(rank: number | undefined) {
    if (rank === 1) return styles.greenIcon;
    if (rank === 2) return styles.yellowIcon;
    if (rank === 3) return styles.redIcon;
    return styles.grayIcon;
}

interface Props {
    className?: string;
    eruData: EruReadinessListItem;
}

function NationalSocietyTypeCard(props: Props) {
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

    return (
        <Container
            className={_cs(styles.nationalSocietyTypeCard, className)}
            withInternalPadding
            withHeaderBorder
            withFooterBorder
            heading={eruData.eru_owner_details.national_society_country_details.society_name}
            headerDescription={(
                <TextOutput
                    className={styles.lastUpdated}
                    label={strings.emergencyResponseUnitOwnerCardLastUpdated}
                    value={eruData.updated_at}
                    valueType="date"
                />
            )}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={setShowReadinessInfoTrue}
                    variant="tertiary"
                    title="Show Readiness Information"
                >
                    Show Readiness Information
                </Button>
            )}
        >
            <TextOutput
                label="ERU Type(s)"
                value={eruTypes}
                strongValue
                withoutLabelColon
            />
            {showReadinessInfo && (
                <Modal
                    className={styles.modal}
                    heading={
                        eruData.eru_owner_details.national_society_country_details.society_name
                    }
                    headerDescription="Readiness Information by ERU Type"
                    onClose={setShowReadinessInfoFalse}
                    withHeaderBorder
                    size="md"
                    contentViewType="vertical"
                    spacing="comfortable"
                >
                    {eruData.eru_types.map((eruType) => (
                        <Container
                            key={eruType.id}
                            heading={eruType.type_display}
                            headingLevel={5}
                            withHeaderBorder
                            childrenContainerClassName={styles.readinessContainer}
                        >
                            <TextOutput
                                className={styles.readiness}
                                label="Equipment Readiness"
                                value={(
                                    <CheckboxCircleLineIcon
                                        className={getReadinessColor(eruType.equipment_readiness)}
                                    />
                                )}
                                valueClassName={styles.icon}
                                withoutLabelColon
                            />
                            <div className={styles.separatorLeft} />
                            <TextOutput
                                className={styles.readiness}
                                label="People Readiness"
                                value={(
                                    <CheckboxCircleLineIcon
                                        className={getReadinessColor(eruType.people_readiness)}
                                    />
                                )}
                                valueClassName={styles.icon}
                                withoutLabelColon
                            />
                            <div className={styles.separatorLeft} />
                            <TextOutput
                                className={styles.readiness}
                                label="Funding EruType"
                                value={(
                                    <CheckboxCircleLineIcon
                                        className={getReadinessColor(eruType.funding_readiness)}
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

export default NationalSocietyTypeCard;
