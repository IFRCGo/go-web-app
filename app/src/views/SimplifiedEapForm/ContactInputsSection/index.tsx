import {
    InputSection,
    TextInput,
} from '@ifrc-go/ui';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import {
    type PartialSimplifiedEapType,
    type ValidContactFieldPrefixes,
} from '../schema';

interface Props {
    title?: React.ReactNode;
    description?: React.ReactNode;
    namePrefix: ValidContactFieldPrefixes;
    value: PartialSimplifiedEapType;
    setFieldValue: (...entries: EntriesAsList<PartialSimplifiedEapType>) => void;
    error: Error<PartialSimplifiedEapType> | undefined;
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

    const error = getErrorObject(formError);

    const name = `${namePrefix}_name` satisfies keyof PartialSimplifiedEapType;
    const title = `${namePrefix}_title` satisfies keyof PartialSimplifiedEapType;
    const email = `${namePrefix}_email` satisfies keyof PartialSimplifiedEapType;
    const phoneNumber = `${namePrefix}_phone_number` satisfies keyof PartialSimplifiedEapType;

    return (
        <InputSection
            title={sectionTitle}
            description={description}
            numPreferredColumns={2}
        >
            <TextInput
                // FIXME: use translations
                label="Name"
                name={name}
                value={value?.[name]}
                onChange={setFieldValue}
                error={error?.[name]}
                disabled={disabled}
                readOnly={readOnly}
            />
            <TextInput
                // FIXME: use translations
                label="Title"
                name={title}
                value={value?.[title]}
                onChange={setFieldValue}
                error={error?.[title]}
                disabled={disabled}
                readOnly={readOnly}
            />
            <TextInput
                // FIXME: use translations
                label="Email"
                name={email}
                value={value?.[email]}
                onChange={setFieldValue}
                error={error?.[email]}
                disabled={disabled}
                readOnly={readOnly}
            />
            <TextInput
                // FIXME: use translations
                label="Phone number"
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
