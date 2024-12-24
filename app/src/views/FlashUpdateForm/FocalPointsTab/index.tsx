import {
    Container,
    InputSection,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import { type FormType } from '../schema';

import i18n from './i18n.json';

interface Props {
    error: Error<FormType> | undefined;
    onValueChange: (...entries: EntriesAsList<FormType>) => void;
    value: FormType;
    disabled?: boolean;
}

function FocalPoints(props: Props) {
    const strings = useTranslation(i18n);
    const {
        error: formError,
        onValueChange,
        value,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    return (
        <>
            <Container>
                <InputSection
                    title={strings.flashUpdateFormFocalOriginatorTitle}
                    description={strings.flashUpdateFormFocalOriginatorDescription}
                >
                    <TextInput
                        name="originator_name"
                        value={value.originator_name}
                        onChange={onValueChange}
                        error={error?.originator_name}
                        label={strings.flashUpdateFormFocalOriginatorNameLabel}
                        disabled={disabled}
                        withAsterisk
                    />
                    <TextInput
                        name="originator_title"
                        value={value.originator_title}
                        onChange={onValueChange}
                        error={error?.originator_title}
                        label={strings.flashUpdateFormFocalOriginatorTitleLabel}
                        disabled={disabled}
                    />
                    <TextInput
                        name="originator_email"
                        value={value.originator_email}
                        onChange={onValueChange}
                        error={error?.originator_email}
                        label={strings.flashUpdateFormFocalOriginatorEmailLabel}
                        disabled={disabled}
                        withAsterisk
                    />
                    <TextInput
                        name="originator_phone"
                        value={value.originator_phone}
                        onChange={onValueChange}
                        error={error?.originator_phone}
                        label={strings.flashUpdateFormFocalOriginatorPhoneLabel}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.flashUpdateFormFocalIfrcTitle}
                    description={strings.flashUpdateFormFocalIfrcDescription}
                >
                    <TextInput
                        name="ifrc_name"
                        value={value.ifrc_name}
                        onChange={onValueChange}
                        error={error?.ifrc_name}
                        label={strings.flashUpdateFormFocalIfrcNameLabel}
                        disabled={disabled}
                    />
                    <TextInput
                        name="ifrc_title"
                        value={value.ifrc_title}
                        onChange={onValueChange}
                        error={error?.ifrc_title}
                        label={strings.flashUpdateFormFocalIfrcTitleLabel}
                        disabled={disabled}
                    />
                    <TextInput
                        name="ifrc_email"
                        value={value.ifrc_email}
                        onChange={onValueChange}
                        error={error?.ifrc_email}
                        label={strings.flashUpdateFormFocalIfrcEmailLabel}
                        disabled={disabled}
                    />
                    <TextInput
                        name="ifrc_phone"
                        value={value.ifrc_phone}
                        onChange={onValueChange}
                        error={error?.ifrc_phone}
                        label={strings.flashUpdateFormFocalIfrcPhoneLabel}
                        disabled={disabled}
                    />
                </InputSection>
            </Container>
            <Container>
                <InputSection
                    title={strings.flashUpdateFormVisibilityTitle}
                >
                    <div>
                        {strings.flashUpdateFormVisibilityDescription}
                    </div>
                </InputSection>
            </Container>
        </>
    );
}

export default FocalPoints;
