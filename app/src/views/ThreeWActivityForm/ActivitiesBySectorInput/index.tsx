import {
    useCallback,
    useMemo,
} from 'react';
import { AddLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Checkbox,
    Container,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
    listToMap,
    randomString,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    type SetBaseValueArg,
    useFormArray,
} from '@togglecorp/toggle-form';

import { type GoApiResponse } from '#utils/restRequest';

import {
    type FormType,
    type PartialActivityItem,
} from '../schema';
import ActivityInput from './ActivityInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Options = GoApiResponse<'/api/v2/emergency-project/options/'>;

interface Props {
    sectorKey: number;
    activities: (PartialActivityItem & { mainIndex: number })[] | undefined;
    actions: Options['actions'] | undefined;
    sectorDetails: Options['sectors'][number] | undefined;
    setValue: (value: SetBaseValueArg<FormType>, partialUpdate?: boolean) => void;
    error?: Error<FormType>;
    setFieldValue: (...entries: EntriesAsList<FormType>) => void;
    disabled?: boolean;
}

function ActivitiesBySectorInput(props: Props) {
    const {
        error,
        sectorKey,
        sectorDetails,
        activities,
        actions,
        setValue,
        setFieldValue,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const selectedActions = useMemo(() => (
        listToMap(
            activities?.map((activity) => activity.action).filter(isDefined),
            (item) => item,
            () => true,
        )
    ), [activities]);

    const handleActionCheckboxChange = useCallback((_: boolean, actionId: number) => {
        setValue((oldValues) => {
            const activityIndex = oldValues?.activities?.findIndex(
                (activity) => activity.action === actionId,
            );
            let newActivities = [...(oldValues?.activities ?? [])];
            if (isNotDefined(activityIndex) || activityIndex === -1) {
                newActivities = [
                    ...newActivities,
                    {
                        client_id: randomString(),
                        is_simplified_report: true,
                        people_households: 'people',
                        sector: sectorKey,
                        action: actionId,
                    },
                ];
            } else {
                newActivities.splice(activityIndex, 1);
            }
            return ({
                ...oldValues,
                activities: newActivities,
            });
        }, true);
    }, [
        setValue,
        sectorKey,
    ]);

    const handleCustomActivityAdd = useCallback(() => {
        setValue((oldValues) => {
            const newActivities = [
                ...(oldValues?.activities ?? []),
                {
                    client_id: randomString(),
                    is_simplified_report: true,
                    people_households: 'people',
                    sector: sectorKey,
                },
            ];
            return ({
                ...oldValues,
                activities: newActivities,
            });
        }, true);
    }, [
        sectorKey,
        setValue,
    ]);

    const handleItemRemove = useCallback((clientId: string) => {
        setValue((oldValues) => {
            const activityIndex = oldValues?.activities?.findIndex(
                (activity) => activity.client_id === clientId,
            );
            const newActivities = [...(oldValues?.activities ?? [])];

            if (isDefined(activityIndex) && activityIndex !== -1) {
                newActivities.splice(activityIndex, 1);
            }
            return ({
                ...oldValues,
                activities: newActivities,
            });
        }, true);
    }, [setValue]);

    const actionsMap = useMemo(() => (
        listToMap(
            actions,
            (action) => action.id,
            (action) => action,
        )
    ), [actions]);

    const actionActivities = useMemo(() => (
        activities?.filter((activity) => isDefined(activity.action))
    ), [activities]);

    const customActivities = useMemo(() => (
        activities?.filter((activity) => isNotDefined(activity.action))
    ), [activities]);

    const {
        setValue: setActivity,
    } = useFormArray<'activities', PartialActivityItem>(
        'activities',
        setFieldValue,
    );

    const activitiesError = useMemo(
        () => getErrorObject(getErrorObject(error)?.activities),
        [error],
    );

    return (
        <Container
            className={styles.attributesBySectorInput}
            heading={sectorDetails?.title}
            childrenContainerClassName={styles.content}
            withHeaderBorder
            withInternalPadding
        >
            <div className={styles.actionsContainer}>
                {actions?.map((action) => (
                    <Checkbox
                        key={action.id}
                        name={action.id}
                        value={selectedActions?.[action.id]}
                        onChange={handleActionCheckboxChange}
                        label={action.title}
                        disabled={disabled}
                    />
                ))}
            </div>
            <div className={styles.buttonsContainer}>
                <Button
                    name={undefined}
                    onClick={handleCustomActivityAdd}
                    variant="secondary"
                    disabled={disabled}
                    icons={(
                        <AddLineIcon />
                    )}
                >
                    {strings.addCustomActivity}
                </Button>
            </div>
            {actionActivities?.map((activity) => (
                <ActivityInput
                    clientId={activity.client_id}
                    key={activity.client_id}
                    value={activity}
                    disabled={disabled}
                    onChange={setActivity}
                    mainIndex={activity.mainIndex}
                    sectorKey={sectorKey}
                    handleRemoveClick={undefined}
                    actionDetails={activity.action ? actionsMap?.[activity.action] : undefined}
                    error={activitiesError?.[activity.client_id]}
                    type="action"
                />
            ))}
            {customActivities?.map((activity, index) => (
                <ActivityInput
                    clientId={activity.client_id}
                    key={activity.client_id}
                    mainIndex={activity.mainIndex}
                    sectorKey={sectorKey}
                    value={activity}
                    disabled={disabled}
                    onChange={setActivity}
                    itemNumber={index + 1}
                    handleRemoveClick={handleItemRemove}
                    error={activitiesError?.[activity.client_id]}
                    type="custom"
                />
            ))}
        </Container>
    );
}

export default ActivitiesBySectorInput;
