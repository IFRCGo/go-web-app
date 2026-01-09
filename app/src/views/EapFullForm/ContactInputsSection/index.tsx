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

import {
    type PartialEapFullFormType,
    type ValidContactFieldPrefixes,
} from '../schema';

import i18n from './i18n.json';

interface Props {
    title?: React.ReactNode;
    description?: React.ReactNode;
    namePrefix: ValidContactFieldPrefixes;
    value: PartialEapFullFormType;
    setFieldValue: (...entries: EntriesAsList<PartialEapFullFormType>) => void;
    error: Error<PartialEapFullFormType> | undefined;
    disabled?: boolean;
    readOnly?: boolean;
}

function ContactInputsSection(props: Props) {
    const {
        title: sectionTitle,
        description,
        namePrefix,
        value,
        setFieldValue,
        error: formError,
        disabled,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);

    const error = getErrorObject(formError);

    const name = `${namePrefix}_name` satisfies keyof PartialEapFullFormType;
    const title = `${namePrefix}_title` satisfies keyof PartialEapFullFormType;
    const email = `${namePrefix}_email` satisfies keyof PartialEapFullFormType;
    const phoneNumber = `${namePrefix}_phone_number` satisfies keyof PartialEapFullFormType;

    return (
        <InputSection
            title={sectionTitle}
            description={description}
            numPreferredColumns={2}
        >
            <TextInput
                label={strings.fullContactNameLabel}
                name={name}
                value={value?.[name]}
                onChange={setFieldValue}
                error={error?.[name]}
                disabled={disabled}
                readOnly={readOnly}
            />
            <TextInput
                label={strings.fullContactTitleLabel}
                name={title}
                value={value?.[title]}
                onChange={setFieldValue}
                error={error?.[title]}
                disabled={disabled}
                readOnly={readOnly}
            />
            <TextInput
                label={strings.fullContactEmailLabel}
                name={email}
                value={value?.[email]}
                onChange={setFieldValue}
                error={error?.[email]}
                disabled={disabled}
                readOnly={readOnly}
            />
            <TextInput
                label={strings.fullContactPhoneLabel}
                name={phoneNumber}
                value={value?.[phoneNumber]}
                onChange={setFieldValue}
                error={error?.[phoneNumber]}
                disabled={disabled}
                readOnly={readOnly}
            />
        </InputSection>
    );
}

export default ContactInputsSection;
