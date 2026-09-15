import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Container,
    IconButton,
    InlineLayout,
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

import NonFieldError from '#components/NonFieldError';
import { type PartialSimplifiedEapType } from '#views/EapSimplifiedForm/schema';

import i18n from './i18n.json';

type PotentialRiskFormFields = NonNullable<
    PartialSimplifiedEapType['potential_risks']
>[number];

interface Props {
    value: PotentialRiskFormFields;
    error: ArrayError<PotentialRiskFormFields> | undefined;
    onChange: (value: SetValueArg<PotentialRiskFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    readOnly?: boolean;
}

function PotentialRiskInput(props: Props) {
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

    return (
        <Container
            spacing="sm"
            headerDescription={error && (
                <NonFieldError error={error} />
            )}
        >
            <InlineLayout
                after={(
                    <IconButton
                        name={index}
                        onClick={onRemove}
                        styleVariant="action"
                        disabled={disabled || readOnly}
                        title={strings.potentialRiskRemoveButtonTitle}
                        ariaLabel={strings.potentialRiskRemoveButtonTitle}
                    >
                        <DeleteBinTwoLineIcon />
                    </IconButton>
                )}
            >
                <TextInput
                    name="risk"
                    value={value.risk}
                    onChange={onFieldChange}
                    readOnly={readOnly}
                    disabled={disabled}
                    error={error?.risk}
                />
            </InlineLayout>
        </Container>
    );
}

export default PotentialRiskInput;
