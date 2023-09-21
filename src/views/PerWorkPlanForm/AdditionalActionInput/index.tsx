import { useMemo } from 'react';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    SetValueArg,
    useFormObject,
    Error,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { randomString } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';
import Container from '#components/Container';
import DateInput from '#components/DateInput';
import SelectInput from '#components/SelectInput';
import Button from '#components/Button';
import TextArea from '#components/TextArea';
import { stringValueSelector } from '#utils/selectors';
import { resolveToString } from '#utils/translation';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import { type GoApiResponse } from '#utils/restRequest';
import NonFieldError from '#components/NonFieldError';

import { PartialWorkPlan } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Value = NonNullable<PartialWorkPlan['additional_action_responses']>[number];

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type PerWorkPlanStatusOption = NonNullable<GlobalEnumsResponse['per_workplanstatus']>[number];

function statusKeySelector(option: PerWorkPlanStatusOption) {
    return option.key;
}

interface Props {
    value: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    error: Error<Value> | undefined;
    index: number;
    onRemove: (index: number) => void;
    actionNumber: number;
    readOnly?: boolean;
    disabled?: boolean;
}

function AdditionalActionInput(props: Props) {
    const {
        onChange,
        index,
        onRemove,
        value,
        error: formError,
        actionNumber,
        readOnly,
        disabled,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);
    const { per_workplanstatus } = useGlobalEnums();

    const defaultValue = useMemo(
        () => ({
            client_id: randomString(),
        }),
        [],
    );

    const onFieldChange = useFormObject(
        index,
        onChange,
        defaultValue,
    );

    return (
        <Container
            className={styles.additionalActionInput}
            heading={resolveToString(
                strings.actionInputHeading,
                { actionNumber },
            )}
            headingLevel={4}
            childrenContainerClassName={styles.content}
            spacing="compact"
            actions={(
                <Button
                    name={index}
                    onClick={onRemove}
                    variant="tertiary"
                    title={strings.actionInputRemoveButtonLabel}
                >
                    <DeleteBinLineIcon />
                </Button>
            )}
        >
            <NonFieldError error={error} />
            <TextArea
                name="actions"
                value={value?.actions}
                onChange={onFieldChange}
                placeholder={strings.actionInputActionsPlaceholder}
                rows={2}
                withAsterisk
                error={error?.actions}
                readOnly={readOnly}
                disabled={disabled}
            />
            <DateInput
                label={strings.actionInputDueDateLabel}
                name="due_date"
                value={value?.due_date}
                onChange={onFieldChange}
                error={error?.due_date}
                readOnly={readOnly}
                disabled={disabled}
            />
            <NationalSocietySelectInput
                name="supported_by"
                label={strings.actionInputSupportedByLabel}
                placeholder={strings.actionInputSupportedByPlaceholder}
                onChange={onFieldChange}
                value={value?.supported_by}
                error={error?.supported_by}
                readOnly={readOnly}
                disabled={disabled}
            />
            <SelectInput
                name="status"
                label={strings.actionInputStatusLabel}
                placeholder={strings.actionInputStatusPlaceholder}
                options={per_workplanstatus}
                withAsterisk
                onChange={onFieldChange}
                keySelector={statusKeySelector}
                labelSelector={stringValueSelector}
                value={value?.status}
                error={error?.status}
                readOnly={readOnly}
                disabled={disabled}
            />
        </Container>
    );
}

export default AdditionalActionInput;
