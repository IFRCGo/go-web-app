import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Container,
    IconButton,
    ListView,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { randomString } from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import { type PartialSimplifiedEapType } from '../schema';

import i18n from './i18n.json';

type PartnerContactsFormFields = NonNullable<PartialSimplifiedEapType['partner_contacts']>[number];

interface Props {
    value: PartnerContactsFormFields;
    error: ArrayError<PartnerContactsFormFields> | undefined;
    onChange: (value: SetValueArg<PartnerContactsFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    readOnly?: boolean;
}

function PartnerContactsInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);

    const onFieldChange = useFormObject(
        index,
        onChange,
        () => ({
            client_id: randomString(),
        }),
    );

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <Container
            headingLevel={5}
            headerActions={(
                <IconButton
                    name={index}
                    onClick={onRemove}
                    disabled={disabled || readOnly}
                    title={strings.partnerNSDeleteButton}
                    ariaLabel={strings.partnerNSDeleteButton}
                >
                    <DeleteBinTwoLineIcon />
                </IconButton>
            )}
            spacing="sm"
            withBorder
            withPadding
        >
            <ListView
                layout="grid"
                numPreferredGridColumns={2}
            >
                <TextInput
                    label={strings.partnerNSNameLabel}
                    name="name"
                    value={value.name}
                    error={error?.name}
                    onChange={onFieldChange}
                    readOnly={readOnly}
                    disabled={disabled}
                />
                <TextInput
                    label={strings.partnerNSTitleLabel}
                    name="title"
                    value={value.title}
                    error={error?.title}
                    onChange={onFieldChange}
                    readOnly={readOnly}
                    disabled={disabled}
                />
                <TextInput
                    label={strings.partnerNSEmailLabel}
                    name="email"
                    value={value.email}
                    error={error?.email}
                    onChange={onFieldChange}
                    readOnly={readOnly}
                    disabled={disabled}
                />
                <TextInput
                    label={strings.partnerNSPhoneNumberLabel}
                    name="phone_number"
                    value={value.phone_number}
                    error={error?.phone_number}
                    onChange={onFieldChange}
                    readOnly={readOnly}
                    disabled={disabled}
                />
            </ListView>
        </Container>
    );
}

export default PartnerContactsInput;
