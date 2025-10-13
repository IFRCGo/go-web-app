import { useCallback } from 'react';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Container,
    IconButton,
    InlineView,
    ListView,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { randomString } from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type PartialForm,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import { type components } from '#generated/types';
import { formatSourceLink } from '#utils/common';

import i18n from './i18n.json';

type EAPSourceInformation = components['schemas']['EAPSourceInformation'] & {
    client_id: string;
};

export type SourceInformationFormFields = PartialForm<
    EAPSourceInformation,
    'client_id'
>;

interface Props {
    value: SourceInformationFormFields;
    error: ArrayError<SourceInformationFormFields> | undefined;
    onChange: (
        value: SetValueArg<SourceInformationFormFields>,
        index: number
    ) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    readOnly?: boolean;
}

function EAPSourceInformationInput(props: Props) {
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

    const onFieldChange = useFormObject(index, onChange, () => ({
        client_id: randomString(),
    }));

    const error = value && value.client_id && errorFromProps
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    const handleSourceFieldChange = useCallback(
        (linkValue: string | undefined) => {
            onFieldChange(formatSourceLink(linkValue), 'source_link');
        },
        [onFieldChange],
    );

    return (
        <Container
            headerDescription={<NonFieldError error={error} />}
            withPadding
            withBorder
        >
            <InlineView
                after={(
                    <IconButton
                        name={index}
                        onClick={onRemove}
                        disabled={disabled || readOnly}
                        title={strings.eapSourceInformationDeleteButton}
                        ariaLabel={strings.eapSourceInformationDeleteButton}
                    >
                        <DeleteBinTwoLineIcon />
                    </IconButton>
                )}
            >
                <ListView layout="grid">
                    <TextInput
                        label={strings.eapSourceInformationNameLabel}
                        name="source_name"
                        value={value.source_name}
                        error={error?.source_name}
                        onChange={onFieldChange}
                        readOnly={readOnly}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.eapSourceInformationLinkLabel}
                        name="source_link"
                        value={value.source_link}
                        error={error?.source_link}
                        onChange={handleSourceFieldChange}
                        readOnly={readOnly}
                        disabled={disabled}
                    />
                </ListView>
            </InlineView>
        </Container>
    );
}

export default EAPSourceInformationInput;
