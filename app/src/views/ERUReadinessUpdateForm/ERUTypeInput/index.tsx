import {
    Container,
    InputSection,
    RadioInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface ERUType {
    eruTypeId: string;
    equipment_readiness: number;
    people_readiness: number;
    funding_readiness: number;
    comments: string;
    comments_text: string | undefined;
    eruTypeTitle: string;
    client_id: string;
}

interface ERUTypeFormInput {
    id: string;
    eruTypes: ERUType[] | undefined;
    eruNationalSociety: string;
}

export interface ReadinessOption {
    value: string;
    key: number;
}

type ERUTypeFormFields = NonNullable<ERUTypeFormInput['eruTypes']>[number];

function readinessKeySelector(option: ReadinessOption) {
    return option.key;
}

function readinessLabelSelector(option: ReadinessOption) {
    return option.value;
}
const defaultValue: ERUTypeFormFields = {
    client_id: '-1',
};

type Value = ERUType;

interface Props {
    index: number;
    value: Value;
    onChange: (value: SetValueArg<ERUTypeFormFields>, index: number) => void;
    titleDisplayMap: string | undefined;
}

function ERUInputType(props: Props) {
    const {
        index,
        value,
        onChange,
        titleDisplayMap,
    } = props;

    const strings = useTranslation(i18n);
    const onFieldChange = useFormObject(index, onChange, defaultValue);

    const fundingReadinessOptions = [
        { key: 1, value: 'Ready' },
        { key: 2, value: 'Can contribute capacity' },
        { key: 3, value: 'No Capacity' },
    ];

    const equipmentReadinessOptions = [
        { key: 1, value: 'Ready' },
        { key: 2, value: 'Can contribute capacity' },
        { key: 3, value: 'No Capacity' },
    ];

    const peopleReadinessOptions = [
        { key: 1, value: 'Ready' },
        { key: 2, value: 'Can contribute capacity' },
        { key: 3, value: 'No Capacity' },
    ];

    const commentsOptions = [
        { key: 1, value: 'Confirm that you have the capacity to lead this type of ERU' },
        { key: 2, value: 'Confirm that you have the capacity to support this type of ERU' },
    ];

    return (
        <Container
            childrenContainerClassName={styles.eruTypes}
            heading={titleDisplayMap}
        >

            <InputSection
                className={styles.readinessOptions}
                title={strings.eruEquipmentReadiness}
            >
                <RadioInput
                    name="equipment_readiness"
                    value={value.equipment_readiness}
                    onChange={onFieldChange}
                    options={equipmentReadinessOptions}
                    keySelector={readinessKeySelector}
                    labelSelector={readinessLabelSelector}
                />
            </InputSection>
            <InputSection
                className={styles.readinessOptions}
                title={strings.eruPeopleReadiness}
            >
                <RadioInput
                    name="people_readiness"
                    value={value.people_readiness}
                    onChange={onFieldChange}
                    options={peopleReadinessOptions}
                    keySelector={readinessKeySelector}
                    labelSelector={readinessLabelSelector}
                />
            </InputSection>
            <InputSection
                className={styles.readinessOptions}
                title={strings.eruFundingReadiness}
            >
                <RadioInput
                    name="funding_readiness"
                    value={value.funding_readiness}
                    onChange={onFieldChange}
                    options={fundingReadinessOptions}
                    keySelector={readinessKeySelector}
                    labelSelector={readinessLabelSelector}
                />
            </InputSection>
            <InputSection
                className={styles.readinessOptions}
                title={strings.eruComments}
            >
                <TextArea
                    name="comments_text"
                    value={value?.comments_text}
                    onChange={onFieldChange}
                />
                <RadioInput
                    name="comments"
                    value={value.comments}
                    onChange={onFieldChange}
                    options={commentsOptions}
                    keySelector={readinessKeySelector}
                    labelSelector={readinessLabelSelector}
                />
            </InputSection>
        </Container>

    );
}

export default ERUInputType;
