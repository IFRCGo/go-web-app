import { useCallback, useMemo } from 'react';
import {
    SetValueArg,
    useFormArray,
    EntriesAsList,
} from '@togglecorp/toggle-form';
import {
    isNotDefined,
    randomString,
    isDefined,
    listToMap,
} from '@togglecorp/fujs';
import { AddLineIcon } from '@ifrc-go/icons';

import Container from '#components/Container';
import Button from '#components/Button';
import Checkbox from '#components/Checkbox';
import type { GoApiResponse } from '#utils/restRequest';

import ActivityInput from './ActivityInput';
import {
    PartialActivityItem,
    FormType,
} from '../schema';

import styles from './styles.module.css';

type Options = GoApiResponse<'/api/v2/emergency-project/options/'>;

interface Props {
    sectorKey: number;
    activities: (PartialActivityItem & { mainIndex: number })[] | undefined;
    actions: Options['actions'] | undefined;
    sectorDetails: Options['sectors'][number] | undefined;
    setValue: (value: SetValueArg<FormType>) => void;
    setFieldValue: (...entries: EntriesAsList<FormType>) => void;
}

function ActivitiesBySectorInput(props: Props) {
    const {
        sectorKey,
        sectorDetails,
        activities,
        actions,
        setValue,
        setFieldValue,
    } = props;

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
        });
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
                    sector: sectorKey,
                },
            ];
            return ({
                ...oldValues,
                activities: newActivities,
            });
        });
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
        });
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
                    />
                ))}
            </div>
            <div className={styles.buttonsContainer}>
                <Button
                    name={undefined}
                    onClick={handleCustomActivityAdd}
                    variant="secondary"
                    icons={(
                        <AddLineIcon />
                    )}
                >
                    Add custom activity
                </Button>
            </div>
            {actionActivities?.map((activity) => (
                <ActivityInput
                    clientId={activity.client_id}
                    key={activity.client_id}
                    value={activity}
                    onChange={setActivity}
                    mainIndex={activity.mainIndex}
                    sectorKey={sectorKey}
                    handleRemoveClick={undefined}
                    actionDetails={activity.action ? actionsMap?.[activity.action] : undefined}
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
                    onChange={setActivity}
                    itemNumber={index + 1}
                    handleRemoveClick={handleItemRemove}
                    type="custom"
                />
            ))}
        </Container>
    );
}

export default ActivitiesBySectorInput;
