import { useCallback } from 'react';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import { type PartialEapFullFormType } from '#views/EapFullForm/schema';

import i18n from './i18n.json';

type SourceInformationFormFields = NonNullable<PartialEapFullFormType['risk_analysis_source_of_information']>[number];

interface Props {
    value: SourceInformationFormFields;
    error: ArrayError<SourceInformationFormFields> | undefined;
    onChange: (value: SetValueArg<SourceInformationFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    readOnly?: boolean;
}

function RiskSourceInformationInput(props: Props) {
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

    const handleSourceFieldChange = useCallback(
        (newValue: string | undefined) => {
            if (
                isNotDefined(newValue)
                || newValue.startsWith('http://')
                || newValue.startsWith('https://')
                || newValue === 'h'
                || newValue === 'ht'
                || newValue === 'htt'
                || newValue === 'http'
                || newValue === 'http:'
                || newValue === 'http:/'
                || newValue === 'https'
                || newValue === 'https:'
                || newValue === 'https:/'
            ) {
                onFieldChange(newValue, 'source_link');
                return;
            }

            onFieldChange(`https://${newValue}`, 'source_link');
        },
        [onFieldChange],
    );

    return (
        <>
            <NonFieldError error={error} />
            <TextInput
                label={strings.eapFullFormRiskSourceInformationNameLabel}
                name="source_name"
                value={value.source_name}
                error={error?.source_name}
                onChange={onFieldChange}
                readOnly={readOnly}
                disabled={disabled}
            />
            <TextInput
                label={strings.eapFullFormRiskSourceInformationLinkLabel}
                name="source_link"
                value={value.source_link}
                error={error?.source_link}
                onChange={handleSourceFieldChange}
                readOnly={readOnly}
                disabled={disabled}
            />
            <Button
                name={index}
                onClick={onRemove}
                styleVariant="action"
                disabled={disabled || readOnly}
                title={strings.eapFullFormSourceRiskInformationDeleteButton}
            >
                <DeleteBinTwoLineIcon />
            </Button>
        </>
    );
}

export default RiskSourceInformationInput;
