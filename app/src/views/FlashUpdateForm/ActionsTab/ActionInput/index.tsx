import {
    Checklist,
    TextArea,
} from '@ifrc-go/ui';
import { randomString } from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    getErrorString,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialActionTaken } from '../../schema';

import styles from './styles.module.css';

type ActionsResponse = GoApiResponse<'/api/v2/flash-update-action/'>;
type Action = NonNullable<ActionsResponse['results']>[number];

const actionKeySelector = (d: Action) => d.id;
const actionLabelSelector = (d: Action) => d.name ?? '---';

const defaultValue: PartialActionTaken = {
    client_id: randomString(),
};

interface Props {
    value: PartialActionTaken;
    // FIXME: Only pass error for this object
    error: ArrayError<PartialActionTaken> | undefined;
    onChange: (value: SetValueArg<PartialActionTaken>, index: number) => void;
    index: number;
    options: Action[];
    disabled?: boolean;
    placeholder?: string;
}

function ActionInput(props: Props) {
    const {
        value,
        error: errorFromProps,
        onChange,
        index,
        disabled,
        options,
        placeholder,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultValue);
    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <div className={styles.actionInput}>
            <NonFieldError error={error} />
            <TextArea
                name="summary"
                value={value.summary}
                onChange={onFieldChange}
                error={error?.summary}
                placeholder={placeholder}
                disabled={disabled}
            />
            <Checklist
                name="actions"
                onChange={onFieldChange}
                options={options}
                labelSelector={actionLabelSelector}
                keySelector={actionKeySelector}
                // tooltipSelector={(d) => d.tooltip_text}
                value={value.actions}
                error={getErrorString(error?.actions)}
                disabled={disabled}
            />
        </div>
    );
}

export default ActionInput;
