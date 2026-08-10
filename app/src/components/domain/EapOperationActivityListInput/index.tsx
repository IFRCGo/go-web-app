import {
    useCallback,
    useMemo,
} from 'react';
import { AddLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    Description,
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

import EapOperationActivityInput from '#components/domain/EapOperationActivityInput';
import {
    type ActivityInputType,
    type OperationActivityFormFields,
} from '#components/domain/EapOperationActivityInput/schema';
import ExplanatoryNote from '#components/ExplanatoryNote';
import NonFieldError from '#components/NonFieldError';
import {
    TIMEFRAME_YEAR,
    type TimeFrameEnumKey,
} from '#utils/constants';

import i18n from './i18n.json';

interface Props<NAME> {
    disabled?: boolean;
    readOnly?: boolean;

    name: NAME,
    value: OperationActivityFormFields[] | undefined;
    onChange: (newValue: SetValueArg<OperationActivityFormFields[]>, name: NAME) => void;
    error: ArrayError<OperationActivityFormFields> | LeafError | undefined;
    withActivationSelection?: boolean;
    withoutTimeframeSelection?: boolean;
    leadTimeframeUnit?: TimeFrameEnumKey;
}

function EapOperationActivityListInput<const NAME extends ActivityInputType>(props: Props<NAME>) {
    const {
        disabled,
        readOnly,

        name,
        value,
        onChange,
        error,
        withActivationSelection,
        withoutTimeframeSelection,
        leadTimeframeUnit,
    } = props;

    const strings = useTranslation(i18n);

    const {
        setValue: onReadinessChange,
        removeValue: onReadinessRemove,
    } = useFormArray<typeof name, OperationActivityFormFields>(
        name,
        onChange,
    );

    const handleReadinessAddButtonClick = useCallback(
        () => {
            let timeframeValue: TimeFrameEnumKey | undefined;
            if (name === 'readiness_activities') {
                timeframeValue = TIMEFRAME_YEAR;
            } else if (name === 'early_action_activities') {
                timeframeValue = leadTimeframeUnit;
            }
            const newActionItem: OperationActivityFormFields = {
                client_id: randomString(),
                timeframe: timeframeValue,
            };

            onChange(
                (oldValue: OperationActivityFormFields[] | undefined) => (
                    [...(oldValue ?? []), newActionItem]
                ),
                name,
            );
        },
        [onChange, name, leadTimeframeUnit],
    );
    const [
        title,
        titleDescription,
        description,
    ] = useMemo(() => {
        if (name === 'readiness_activities') {
            return [
                strings.readinessTitle,
                strings.readinessTitleDescription,
                strings.readinessDescription,
            ];
        }

        if (name === 'prepositioning_activities') {
            return [
                strings.prepositioningTitle,
                strings.prepositioningTitleDescription,
                strings.prepositioningDescription,
            ];
        }

        if (name === 'early_action_activities') {
            return [
                strings.earlyActionTitle,
                strings.earlyActionTitleDescription,
                strings.earlyActionDescription,
            ];
        }

        return [];
    }, [name, strings]);

    return (
        <Container
            spacing="sm"
            withDarkBackground
            headerDescription={titleDescription}
            withHeaderBorder
            withPadding
            heading={(
                <ListView spacing="sm">
                    {title}
                    {(title && description) && (
                        <ExplanatoryNote
                            heading={title}
                            ariaLabel={title}
                            title={title}
                            content={(
                                <Description>
                                    {description}
                                </Description>
                            )}
                        />
                    )}
                </ListView>
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
                    <EapOperationActivityInput
                        name={name}
                        key={activity.client_id}
                        index={i}
                        value={activity}
                        onChange={onReadinessChange}
                        onRemove={onReadinessRemove}
                        error={getErrorObject(error)}
                        disabled={disabled}
                        readOnly={readOnly}
                        withActivationSelection={withActivationSelection}
                        withoutTimeframeSelection={withoutTimeframeSelection}
                        leadTimeframeUnit={leadTimeframeUnit}
                    />
                ))}
            </ListView>
        </Container>
    );
}

export default EapOperationActivityListInput;
