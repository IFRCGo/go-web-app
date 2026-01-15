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

type PrioritisedImpactFormFields = NonNullable<
    PartialEapFullFormType['prioritized_impacts']
>[number];

interface Props {
    value: PrioritisedImpactFormFields;
    error: ArrayError<PrioritisedImpactFormFields> | undefined;
    onChange: (value: SetValueArg<PrioritisedImpactFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    readOnly?: boolean;
}

function PrioritisedImpactInput(props: Props) {
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
            headerDescription={error && (
                <NonFieldError error={error} />
            )}
        >
            <InlineLayout
                after={(
                    <IconButton
                        name={index}
                        onClick={onRemove}
                        styleVariant="action"
                        disabled={disabled || readOnly}
                        // FIXME use translation strings
                        title="Remove prioritized impact"
                        ariaLabel="Remove prioritized impact"
                    >
                        <DeleteBinTwoLineIcon />
                    </IconButton>
                )}
            >
                <TextInput
                    name="impact"
                    value={value.impact}
                    onChange={onFieldChange}
                    readOnly={readOnly}
                    disabled={disabled}
                    error={error?.impact}
                />
            </InlineLayout>
        </Container>
    );
}

export default PrioritisedImpactInput;
