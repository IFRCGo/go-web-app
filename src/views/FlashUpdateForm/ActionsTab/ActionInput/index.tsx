import {
    ArrayError,
    getErrorString,
    useFormObject,
    SetValueArg,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { randomString } from '@togglecorp/fujs';

import Checklist from '#components/Checklist';
import TextArea from '#components/TextArea';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialActionTaken } from '../../schema';
import styles from './styles.module.css';

type ActionsResponse = GoApiResponse<'/api/v2/flash-update-action/'>;
type Action = NonNullable<ActionsResponse['results']>[number];

const defaultValue: PartialActionTaken = {
    client_id: randomString(),
};

interface Props {
    value: PartialActionTaken;
    error: ArrayError<PartialActionTaken> | undefined;
    onChange: (value: SetValueArg<PartialActionTaken>, index: number) => void;
    index: number;
    actionOptions: Action[];
    placeholder?: string;
}

function ActionInput(props: Props) {
    const {
        value,
        error: errorFromProps,
        onChange,
        index,
        actionOptions,
        placeholder,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultValue);
    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <div className={styles.actionInput}>
            <TextArea
                name="summary"
                value={value.summary}
                onChange={onFieldChange}
                error={error?.summary}
                placeholder={placeholder}
            />
            <Checklist
                name="actions"
                onChange={onFieldChange}
                options={actionOptions}
                labelSelector={(d) => d.name ?? ''}
                keySelector={(d) => d.id}
                // tooltipSelector={(d) => d.tooltip_text}
                value={value.actions}
                error={getErrorString(error?.actions)}
            />
        </div>
    );
}

export default ActionInput;
