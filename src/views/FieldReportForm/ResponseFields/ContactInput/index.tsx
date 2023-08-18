import React from 'react';
import {
    type Error,
    getErrorObject,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import useTranslation from '#hooks/useTranslation';
import TextInput from '#components/TextInput';

import {
    type PartialFormValue,
    type ContactType,
} from '../../common';

import i18n from './i18n.json';

export type ContactValue = NonNullable<PartialFormValue['contacts']>[number];

interface ContactInputProps {
    name: number | undefined;
    contactType: ContactType;
    error: Error<ContactValue> | undefined;
    onChange: (value: SetValueArg<ContactValue>, index: number | undefined) => void;
    value: ContactValue | undefined;
    disabled?: boolean;
}

function ContactInput(props: ContactInputProps) {
    const {
        name,
        contactType,
        error: formError,
        onChange,
        value,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const setFieldValue = useFormObject(
        name,
        onChange,
        () => ({
            ctype: contactType,
        }),
    );

    const error = React.useMemo(
        () => getErrorObject(formError),
        [formError],
    );

    // FIXME: add non-field errors
    return (
        <>
            <TextInput
                name="name"
                value={value?.name}
                onChange={setFieldValue}
                error={error?.name}
                label={strings.cmpContactName}
                disabled={disabled}
            />
            <TextInput
                name="title"
                value={value?.title}
                onChange={setFieldValue}
                error={error?.title}
                label={strings.cmpContactTitle}
                disabled={disabled}
            />
            <TextInput
                name="email"
                value={value?.email}
                onChange={setFieldValue}
                error={error?.email}
                label={strings.cmpContactEmail}
                disabled={disabled}
            />
            <TextInput
                name="phone"
                value={value?.phone}
                onChange={setFieldValue}
                error={error?.phone}
                label={strings.cmpContactPhone}
                disabled={disabled}
            />
        </>
    );
}

export default ContactInput;
