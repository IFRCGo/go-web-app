import { useCallback } from 'react';
import { AddLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type LeafError,
    type SetValueArg,
    useFormArray,
} from '@togglecorp/toggle-form';

import EapIndicatorInput from '#components/domain/EapIndicatorInput';
import { type IndicatorFormFields } from '#components/domain/EapIndicatorInput/schema';
import NonFieldError from '#components/NonFieldError';

import i18n from './i18n.json';

type FormName = 'indicators';

interface Props<NAME> {
    disabled?: boolean;
    readOnly?: boolean;

    name: NAME,
    value: IndicatorFormFields[] | undefined;
    onChange: (newValue: SetValueArg<IndicatorFormFields[]>, name: NAME) => void;
    error: ArrayError<IndicatorFormFields> | LeafError | undefined;
}

function EapIndicatorListInput<const NAME extends FormName>(props: Props<NAME>) {
    const {
        disabled,
        readOnly,

        name,
        value,
        onChange,
        error,
    } = props;

    const strings = useTranslation(i18n);

    const {
        setValue: onReadinessChange,
        removeValue: onReadinessRemove,
    } = useFormArray<typeof name, IndicatorFormFields>(
        name,
        onChange,
    );

    const handleReadinessAddButtonClick = useCallback(
        () => {
            const newActionItem: IndicatorFormFields = {
                client_id: randomString(),
            };

            onChange(
                (oldValue: IndicatorFormFields[] | undefined) => (
                    [...(oldValue ?? []), newActionItem]
                ),
                name,
            );
        },
        [onChange, name],
    );

    return (
        <Container
            spacing="sm"
            withDarkBackground
            withHeaderBorder
            withPadding
            heading={(
                <>
                    {strings.indicatorsTitle}
                    <span>*</span>
                </>
            )}
            headingLevel={5}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handleReadinessAddButtonClick}
                    spacing="sm"
                    disabled={disabled || readOnly}
                    before={<AddLineIcon />}
                >
                    {strings.addButtonLabel}
                </Button>
            )}
            withCompactMessage
            empty={isNotDefined(value)
                || value.length === 0}
            emptyMessage={strings.emptyMessage}
            footer={<NonFieldError error={getErrorObject(error)} />}
        >
            <ListView
                layout="block"
                spacing="sm"
            >
                {value?.map((activity, i) => (
                    <EapIndicatorInput
                        key={activity.client_id}
                        index={i}
                        value={activity}
                        onChange={onReadinessChange}
                        onRemove={onReadinessRemove}
                        error={getErrorObject(error)}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                ))}
            </ListView>
        </Container>
    );
}

export default EapIndicatorListInput;
