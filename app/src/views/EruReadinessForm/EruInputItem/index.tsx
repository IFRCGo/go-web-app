import {
    Checkbox,
    Container,
    InputSection,
    RadioInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type PartialForm,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { type GoApiResponse } from '#utils/restRequest';

import { type EruType } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;

type ReadinessOption = NonNullable<GlobalEnumsResponse['deployments_eru_readiness_status']>[number];

function readinessKeySelector(option: ReadinessOption) {
    return option.key;
}

function readinessLabelSelector(option: ReadinessOption) {
    return option.value;
}

const defaultCollectionValue: PartialForm<EruType> = {
    client_id: randomString(),
};

interface Props {
    index: number;
    value: PartialForm<EruType>;
    onChange: (value: SetValueArg<PartialForm<EruType>>, index: number) => void;
    title: Record<string, string> | undefined;
    error: ArrayError<EruType> | undefined;
}

function EruInputItem(props: Props) {
    const {
        index,
        value,
        onChange,
        title,
        error: errorFromProps,
    } = props;

    const strings = useTranslation(i18n);

    const {
        deployments_eru_readiness_status,
    } = useGlobalEnums();

    const onFieldChange = useFormObject(
        index,
        onChange,
        defaultCollectionValue,
    );
    const eruTypeLabel = isDefined(value.type)
        ? title?.[value.type]
        : undefined;
    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <Container
            childrenContainerClassName={styles.eruTypes}
            heading={eruTypeLabel}
        >
            <InputSection
                className={styles.readinessOptions}
                title={strings.eruEquipmentReadiness}
            >
                <RadioInput
                    listContainerClassName={styles.readinessList}
                    name="equipment_readiness"
                    value={value.equipment_readiness}
                    onChange={onFieldChange}
                    options={deployments_eru_readiness_status}
                    keySelector={readinessKeySelector}
                    labelSelector={readinessLabelSelector}
                    error={error?.equipment_readiness}
                />
            </InputSection>
            <InputSection
                className={styles.readinessOptions}
                title={strings.eruPeopleReadiness}
            >
                <RadioInput
                    listContainerClassName={styles.readinessList}
                    name="people_readiness"
                    value={value.people_readiness}
                    onChange={onFieldChange}
                    options={deployments_eru_readiness_status}
                    keySelector={readinessKeySelector}
                    labelSelector={readinessLabelSelector}
                    error={error?.people_readiness}
                />
            </InputSection>
            <InputSection
                className={styles.readinessOptions}
                title={strings.eruFundingReadiness}
            >
                <RadioInput
                    listContainerClassName={styles.readinessList}
                    name="funding_readiness"
                    value={value.funding_readiness}
                    onChange={onFieldChange}
                    options={deployments_eru_readiness_status}
                    keySelector={readinessKeySelector}
                    labelSelector={readinessLabelSelector}
                    error={error?.funding_readiness}
                />
            </InputSection>
            <InputSection
                className={styles.readinessOptions}
                title={strings.eruComments}
            >
                <TextArea
                    name="comment"
                    value={value?.comment}
                    onChange={onFieldChange}
                    error={error?.comment}
                />
                <Checkbox
                    label={strings.eruLead}
                    name="has_capacity_to_lead"
                    value={value.has_capacity_to_lead}
                    onChange={onFieldChange}
                    error={error?.has_capacity_to_lead}
                />
                <Checkbox
                    label={strings.eruSupport}
                    name="has_capacity_to_support"
                    value={value.has_capacity_to_support}
                    onChange={onFieldChange}
                    error={error?.has_capacity_to_support}
                />
            </InputSection>
        </Container>

    );
}

export default EruInputItem;
