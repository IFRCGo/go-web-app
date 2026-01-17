import { useCallback } from 'react';
import {
    InputSection,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import i18n from './i18n.json';

type ContactFields = 'name' | 'title' | 'email' | 'phone_number';
type PrefixFromKey<K extends string> = K extends `${infer P}_${ContactFields}` ? P : never;

type HasAllKeys<K extends string, P extends string> =
    `${P}_name` extends K
        ? `${P}_title` extends K
            ? `${P}_email` extends K
                ? `${P}_phone_number` extends K
                    ? true
                    : false
                : false
            : false
        : false;

type ValidPrefixes<K extends string> =
    PrefixFromKey<K> extends infer P
        ? P extends string
            ? HasAllKeys<K, P> extends true ? P : never
            : never
        : never;

interface Props<
    FORM_VALUE extends object,
    NAME_PREFIX extends ValidPrefixes<Extract<keyof FORM_VALUE, string>>
> {
    namePrefix: NAME_PREFIX;
    value: FORM_VALUE;
    setFieldValue: (...entries: EntriesAsList<FORM_VALUE>) => void;
    error: Error<FORM_VALUE> | undefined;

    title?: React.ReactNode;
    description?: React.ReactNode;
    disabled?: boolean;
    readOnly?: boolean;
    withAsteriskOnTitle?: boolean;
    withRequiredNameAndEmail?: boolean;
}

function ContactInputsSection<
    FORM_VALUE extends object,
    const NAME_PREFIX extends ValidPrefixes<Extract<keyof FORM_VALUE, string>>
>(props: Props<FORM_VALUE, NAME_PREFIX>) {
    const {
        title: sectionTitle,
        description,
        namePrefix,
        value,
        setFieldValue,
        error: formError,
        disabled,
        readOnly,
        withAsteriskOnTitle,
        withRequiredNameAndEmail,
    } = props;

    const strings = useTranslation(i18n);

    const error = getErrorObject(formError);

    function getContactFieldValue(field: ContactFields) {
        return value?.[`${namePrefix}_${field}`];
    }

    function getContactFieldError(field: ContactFields) {
        return error?.[`${namePrefix}_${field}`] as string | undefined;
    }

    const setContactFieldValue = useCallback(
        (newValue: string | undefined, field: ContactFields) => {
            const fieldName = `${namePrefix}_${field}` as const;
            setFieldValue(newValue as ReturnType<typeof getContactFieldValue>, fieldName);
        },
        [setFieldValue, namePrefix],
    );

    return (
        <InputSection
            title={sectionTitle}
            description={description}
            numPreferredColumns={2}
            withAsteriskOnTitle={withAsteriskOnTitle}
        >
            <TextInput
                label={strings.contactNameInputLabel}
                name="name"
                value={getContactFieldValue('name')}
                error={getContactFieldError('name')}
                onChange={setContactFieldValue}
                disabled={disabled}
                readOnly={readOnly}
                required={withRequiredNameAndEmail}
            />
            <TextInput
                label={strings.contactTitleInputLabel}
                name="title"
                value={getContactFieldValue('title')}
                error={getContactFieldError('title')}
                onChange={setContactFieldValue}
                disabled={disabled}
                readOnly={readOnly}
            />
            <TextInput
                label={strings.contactEmailInputLabel}
                name="email"
                value={getContactFieldValue('email')}
                error={getContactFieldError('email')}
                onChange={setContactFieldValue}
                disabled={disabled}
                readOnly={readOnly}
                required={withRequiredNameAndEmail}
            />
            <TextInput
                label={strings.contactPhoneInputLabel}
                name="phone_number"
                value={getContactFieldValue('phone_number')}
                error={getContactFieldError('phone_number')}
                onChange={setContactFieldValue}
                disabled={disabled}
                readOnly={readOnly}
            />
        </InputSection>
    );
}

export default ContactInputsSection;
