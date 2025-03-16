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
type EruTypesList = NonNullable<EruReadinessListItem['eru_types']>[number];

interface Props {
    className?: string;
    societyName? : string;
    updatedAt?: string;
    eruTypes?: EruReadinessListItem;
}

function NationalSocietyTypeCard(props: Props) {
    const {
        className,
        societyName,
        updatedAt,
        eruTypes,
    } = props;

    const strings = useTranslation(i18n);

    const [
        showReadinessInfo,
        {
            setTrue: setShowReadinessInfoTrue,
            setFalse: setShowReadinessInfoFalse,
        },
    ] = useBooleanState(false);

    const eruTypesList = eruTypes?.eru_types?.map((i) => i.type).join(', ');

    return (
        <Container
            className={_cs(styles.emergencyResponseUnitOwnerCard, className)}
            withInternalPadding
            withHeaderBorder
            spacing="default"
            heading={societyName}
            headerDescription={(
                <TextOutput
                    className={styles.lastUpdated}
                    label={strings.emergencyResponseUnitOwnerCardLastUpdated}
                    value={updatedAt}
                    valueType="date"
                />
            )}
            // childrenContainerClassName={styles.figures}
        >
            <TextOutput
                className={styles.lastUpdated}
                label="ERU Types"
                value={eruTypesList}
                withoutLabelColon
            />
            <Button
                name={undefined}
                onClick={setShowReadinessInfoTrue}
                variant="tertiary"
                title="Show Readiness Information"
            >
                Show Readiness Information
            </Button>
            {showReadinessInfo && (
                <Modal
                    heading={societyName}
                    headingDescription="Readiness Information by ERU Type"
                    onClose={setShowReadinessInfoFalse}
                    withHeaderBorder
                >
                    <Heading>
                        {eruTypesList}
                    </Heading>
                    <TextOutput
                        className={styles.lastUpdated}
                        label="Equipment Readiness"
                        value={<AlertCheckLineIcon />}
                        valueClassName={styles.readinessIcon}
                        withoutLabelColon
                    />
                    <TextOutput
                        className={styles.lastUpdated}
                        label="People Readiness"
                        value={<AlertCheckLineIcon />}
                        valueClassName={styles.readinessIcon}
                        withoutLabelColon
                    />
                    <TextOutput
                        className={styles.lastUpdated}
                        label="Funding Readiness"
                        value={<AlertCheckLineIcon />}
                        valueClassName={styles.readinessIcon}
                        withoutLabelColon
                    />
                </Modal>
            )}
        </Container>
    );
}

export default NationalSocietyTypeCard;
