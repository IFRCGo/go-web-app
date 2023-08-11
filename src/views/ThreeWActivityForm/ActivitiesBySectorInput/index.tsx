import { useCallback, useMemo } from 'react';
import {
    SetValueArg,
} from '@togglecorp/toggle-form';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import Checkbox from '#components/Checkbox';
import type { GoApiResponse } from '#utils/restRequest';

import Checklist from '#components/Checklist';

import { PartialActivityItem } from '../schema';

import styles from './styles.module.css';

type Options = GoApiResponse<'/api/v2/emergency-project/options/'>;

interface Props {
    sectorKey: number;
    activities: PartialActivityItem[] | undefined;
    actions: Options['actions'] | undefined;
    sectorDetails: Options['sectors'][number] | undefined;
    setActivity: (value: SetValueArg<PartialActivityItem>, index: number) => void;
    removeActivity: (index: number) => void;
}

function ActivitiesBySectorInput(props: Props) {
    const {
        sectorKey,
        sectorDetails,
        activities,
        actions,
        setActivity,
        removeActivity,
    } = props;

    const selectedActions = useMemo(() => (
        listToMap(
            activities?.map((activity) => activity.action).filter(isDefined),
            (item) => item,
            () => true,
        )
    ), [activities]);

    const handleActionCheckboxChange = useCallback((newValue: boolean, actionId: number) => {
        console.warn('here', newValue, actionId);
    }, []);

    console.warn('here', activities, sectorKey);

    return (
        <Container
            className={styles.attributesBySectorInput}
            heading={sectorDetails?.title}
        >
            {actions?.map((action) => (
                <Checkbox
                    name={action.id}
                    value={selectedActions?.[action.id]}
                    onChange={handleActionCheckboxChange}
                    label={action.title}
                />
            ))}
        </Container>
    );
}

export default ActivitiesBySectorInput;
