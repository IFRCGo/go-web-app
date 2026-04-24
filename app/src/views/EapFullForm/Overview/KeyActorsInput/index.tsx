import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Container,
    IconButton,
    InlineLayout,
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
import { charLimits } from '#views/EapFullForm/common';
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
        <Container
            withPadding
            withBorder
            spacing="sm"
            headerDescription={(
                <NonFieldError error={error} />
            )}
        >
            <InlineLayout
                after={(
                    <IconButton
                        name={index}
                        onClick={onRemove}
                        disabled={disabled || readOnly}
                        title={strings.overviewKeyActorsDeleteButton}
                        ariaLabel={strings.overviewKeyActorsDeleteButton}
                    >
                        <DeleteBinTwoLineIcon />
                    </IconButton>
                )}
                contentAlignment="start"
                spacing="sm"
            >
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <NationalSocietySelectInput
                        placeholder={strings.overviewKeyActorsSelectPartnerLabel}
                        error={error?.national_society}
                        name="national_society"
                        onChange={onFieldChange}
                        value={value?.national_society}
                        disabled={disabled}
                        readOnly={readOnly}
                        required
                    />
                    <TextArea
                        label={strings.overviewKeyActorsDescriptionLabel}
                        error={error?.description}
                        name="description"
                        value={value?.description}
                        onChange={onFieldChange}
                        required
                        maxLength={charLimits.key_actors}
                        readOnly={readOnly}
                    />
                </ListView>
            </InlineLayout>
        </Container>
    );
}

export default KeyActorsInput;
