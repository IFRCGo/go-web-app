import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Heading,
    InlineView,
    ListView,
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

import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import NonFieldError from '#components/NonFieldError';
import { type PartialEapFullFormType } from '#views/EapFullForm/schema';

import i18n from './i18n.json';

type KeyActorsFormFields = NonNullable<
    PartialEapFullFormType['key_actors']
>[number];

interface Props {
    value: KeyActorsFormFields;
    error: ArrayError<KeyActorsFormFields> | undefined;
    onChange: (value: SetValueArg<KeyActorsFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    readOnly?: boolean;
}

function KeyActorsInput(props: Props) {
    const {
        value,
        onChange,
        onRemove,
        index,
        disabled,
        readOnly,
        error: errorFromProps,
    } = props;

    const strings = useTranslation(i18n);

    const onFieldChange = useFormObject(index, onChange, () => ({
        client_id: randomString(),
    }));

    const error = value && value.client_id && errorFromProps
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <>
            <Heading level={5}>
                {`Key Actor #${index + 1}`}
            </Heading>
            <NonFieldError error={error} />
            <InlineView
                after={(
                    <Button
                        name={index}
                        onClick={onRemove}
                        styleVariant="action"
                        disabled={disabled || readOnly}
                        title={strings.overviewKeyActorsDeleteButton}
                    >
                        <DeleteBinTwoLineIcon />
                    </Button>
                )}
            >
                <ListView layout="block">
                    <NationalSocietySelectInput
                        label={strings.overviewKeyActorsSelectPartnerLabel}
                        error={error?.national_society}
                        name="national_society"
                        onChange={onFieldChange}
                        value={value?.national_society}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                    <TextArea
                        required
                        label={strings.overviewKeyActorsDescriptionLabel}
                        name="description"
                        value={value?.description}
                        onChange={onFieldChange}
                    />
                </ListView>
            </InlineView>
        </>
    );
}

export default KeyActorsInput;
