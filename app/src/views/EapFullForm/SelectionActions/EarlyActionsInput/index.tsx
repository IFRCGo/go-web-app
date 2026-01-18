import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Container,
    IconButton,
    InlineLayout,
    TextInput,
} from '@ifrc-go/ui';
import { randomString } from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import { type PartialEapFullFormType } from '#views/EapFullForm/schema';

type EarlyActionsFormFields = NonNullable<
    PartialEapFullFormType['early_actions']
>[number];

interface Props {
    value: EarlyActionsFormFields;
    error: ArrayError<EarlyActionsFormFields> | undefined;
    onChange: (value: SetValueArg<EarlyActionsFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    readOnly?: boolean;
}

function EarlyActionsInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
        readOnly,
    } = props;

    const onFieldChange = useFormObject(index, onChange, () => ({
        client_id: randomString(),
    }));

    const error = value && value.client_id && errorFromProps
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <Container
            spacing="sm"
            footer={error && (
                <NonFieldError error={error} />
            )}
        >
            <InlineLayout
                after={(
                    <IconButton
                        name={index}
                        onClick={onRemove}
                        disabled={disabled || readOnly}
                        // FIXME use translation strings
                        title="Remove early action"
                        // FIXME use translation strings
                        ariaLabel="Remove early action"
                    >
                        <DeleteBinTwoLineIcon />
                    </IconButton>
                )}
            >
                <TextInput
                    name="action"
                    value={value.action}
                    onChange={onFieldChange}
                    readOnly={readOnly}
                    disabled={disabled}
                    error={error?.action}
                />
            </InlineLayout>
        </Container>
    );
}

export default EarlyActionsInput;
