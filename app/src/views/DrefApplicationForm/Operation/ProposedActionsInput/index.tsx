import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    IconButton,
    NumberInput,
    SelectInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import { type GoApiResponse } from '#utils/restRequest';

import { type PartialDref } from '../../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type ProposedActionsFormFields = NonNullable<PartialDref['proposed_action']>[number];
type ActivityOptions = NonNullable<GoApiResponse<'/api/v2/primarysector'>>[number];

function activityLabelSelector(option: ActivityOptions) {
    return option.label;
}

function activityKeySelector(option: ActivityOptions) {
    return option.key;
}

const defaultProposedActionsValue: ProposedActionsFormFields = {
    client_id: '-1',
};

interface Props {
    value: ProposedActionsFormFields;
    error: ArrayError<ProposedActionsFormFields> | undefined;
    onChange: (
        value: SetValueArg<ProposedActionsFormFields>,
        index: number,
    ) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    activityOptions?: ActivityOptions[];
}
function ProposedActionsInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        onRemove,
        index,
        activityOptions,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const onProposedActionChange = useFormObject(index, onChange, defaultProposedActionsValue);

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <div className={styles.proposedActionsInput}>
            <div className={styles.activity}>
                <SelectInput
                    required
                    className={styles.input}
                    label={strings.drefFormProposedActionActivityLabel}
                    name="activity"
                    readOnly
                    value={value.activity}
                    options={activityOptions}
                    onChange={onProposedActionChange}
                    error={error?.activity}
                    keySelector={activityKeySelector}
                    labelSelector={activityLabelSelector}
                />
                <NumberInput
                    required
                    className={styles.input}
                    name="budget"
                    value={value.budget}
                    label={strings.drefFormProposedActionBudgetLabel}
                    onChange={onProposedActionChange}
                    disabled={disabled}
                    error={error?.budget}
                />
            </div>
            <IconButton
                className={styles.button}
                name={index}
                onClick={onRemove}
                title={strings.drefFormRemoveActivity}
                ariaLabel={strings.drefFormRemoveActivity}
                round={false}
                variant="tertiary"
                disabled={disabled}
            >
                <DeleteBinLineIcon />
            </IconButton>
        </div>
    );
}

export default ProposedActionsInput;
