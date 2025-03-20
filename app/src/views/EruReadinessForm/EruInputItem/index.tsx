import { useMemo } from 'react';
import {
    Checkbox,
    InputSection,
    RadioInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { randomString } from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialEruItem } from '../schema';

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

const defaultCollectionValue: PartialEruItem = {
    client_id: randomString(),
};

interface Props {
    index: number;
    value: PartialEruItem;
    onChange: (value: SetValueArg<PartialEruItem>, index: number) => void;
    error: ArrayError<PartialEruItem> | undefined;
}

function EruInputItem(props: Props) {
    const {
        index,
        value,
        onChange,
        error: errorFromProps,
    } = props;

    const strings = useTranslation(i18n);

    const {
        deployments_eru_type: eruTypeOptions,
        deployments_eru_readiness_status,
    } = useGlobalEnums();

    const onFieldChange = useFormObject(
        index,
        onChange,
        defaultCollectionValue,
    );

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    const title = useMemo(() => (
        eruTypeOptions?.find((eruType) => eruType.key === value.type)?.value
    ), [eruTypeOptions, value.type]);

    return (
        <InputSection
            title={title}
            className={styles.eruInputItem}
            contentSectionClassName={styles.content}
        >
            <InputSection
                title={strings.eruEquipmentReadiness}
                className={styles.inputSection}
            >
                <RadioInput
                    className={styles.readinessInput}
                    listContainerClassName={styles.radioList}
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
                title={strings.eruPeopleReadiness}
                className={styles.inputSection}
            >
                <RadioInput
                    className={styles.readinessInput}
                    listContainerClassName={styles.radioList}
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
                title={strings.eruFundingReadiness}
                className={styles.inputSection}
            >
                <RadioInput
                    className={styles.readinessInput}
                    listContainerClassName={styles.radioList}
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
                title={strings.eruComments}
                className={styles.inputSection}
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
                    value={value?.has_capacity_to_lead}
                    onChange={onFieldChange}
                    error={error?.has_capacity_to_lead}
                />
                <Checkbox
                    label={strings.eruSupport}
                    name="has_capacity_to_support"
                    value={value?.has_capacity_to_support}
                    onChange={onFieldChange}
                    error={error?.has_capacity_to_support}
                />
            </InputSection>
        </InputSection>
    );
}

export default EruInputItem;
