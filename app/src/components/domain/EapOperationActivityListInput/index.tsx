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
import { resolveToComponent } from '@ifrc-go/ui/utils';
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

import EapOperationActivityInput, { type ActivityInputType } from '#components/domain/EapOperationActivityInput';
import { type OperationActivityFormFields } from '#components/domain/EapOperationActivityInput/schema';
import ExplanatoryNote from '#components/ExplanatoryNote';
import Link from '#components/Link';
import NonFieldError from '#components/NonFieldError';
import { TIMEFRAME_YEAR } from '#utils/constants';

import i18n from './i18n.json';

interface Props<NAME> {
    disabled?: boolean;
    readOnly?: boolean;

    name: NAME,
    value: OperationActivityFormFields[] | undefined;
    onChange: (newValue: SetValueArg<OperationActivityFormFields[]>, name: NAME) => void;
    error: ArrayError<OperationActivityFormFields> | LeafError | undefined;
}

function EapOperationActivityListInput<const NAME extends ActivityInputType>(props: Props<NAME>) {
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
    } = useFormArray<typeof name, OperationActivityFormFields>(
        name,
        onChange,
    );

    const handleReadinessAddButtonClick = useCallback(
        () => {
            const timeframeValue = name === 'readiness_activities' || name === 'prepositioning_activities'
                ? TIMEFRAME_YEAR
                : undefined;
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
        [onChange, name],
    );

    const [
        title,
        description,
    ] = useMemo(() => {
        if (name === 'readiness_activities') {
            return [strings.readinessTitle, strings.readinessDescription];
        }

        if (name === 'prepositioning_activities') {
            return [strings.prepositioningTitle, strings.prepositioningDescription];
        }

        if (name === 'early_action_activities') {
            return [
                strings.earlyActionTitle,
                resolveToComponent(
                    strings.earlyActionDescription,
                    {
                        earlyActionDatabaseLink: (
                            <Link
                                href="https://www.anticipation-hub.org/experience/early-action/early-action-database/ea-list"
                                styleVariant="action"
                                external
                                withLinkIcon
                            >
                                {strings.earlyActionDatabaseLinkLabel}
                            </Link>
                        ),
                    },
                ),
            ];
        }

        return [];
    }, [name, strings]);

    return (
        <Container
            spacing="sm"
            withDarkBackground
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
                    />
                ))}
            </ListView>
        </Container>
    );
}

export default EapOperationActivityListInput;
