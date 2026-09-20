import {
    ListView,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { type SpacingType } from '@ifrc-go/ui/utils';
import { getErrorObject } from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';

import type useRecoverAccountForm from './useRecoverAccountForm';

import i18n from './i18n.json';

type RecoverAccountFormState = ReturnType<typeof useRecoverAccountForm>;

interface Props {
    className?: string;
    spacing?: SpacingType;
    value: RecoverAccountFormState['value'];
    error: RecoverAccountFormState['error'];
    setFieldValue: RecoverAccountFormState['setFieldValue'];
    disabled?: boolean;
    actions?: React.ReactNode;
}

function RecoverAccountForm(props: Props) {
    const {
        className,
        spacing,
        value,
        error,
        setFieldValue,
        disabled,
        actions,
    } = props;

    const strings = useTranslation(i18n);

    const fieldError = getErrorObject(error);

    return (
        <ListView
            className={className}
            layout="block"
            spacing={spacing}
        >
            <NonFieldError
                error={error}
                withFallbackError
            />
            <TextInput
                name="email"
                label={strings.emailInputLabel}
                value={value.email}
                onChange={setFieldValue}
                error={fieldError?.email}
                disabled={disabled}
                withAsterisk
                autoFocus
            />
            {actions}
        </ListView>
    );
}

export default RecoverAccountForm;
