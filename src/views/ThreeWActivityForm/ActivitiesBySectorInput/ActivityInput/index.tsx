import { DeleteBinLineIcon } from '@ifrc-go/icons';
import { randomString } from '@togglecorp/fujs';
import {
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import ExpandableContainer from '#components/ExpandableContainer';
import Button from '#components/Button';
import TextInput from '#components/TextInput';
import TextArea from '#components/TextArea';
import type { GoApiResponse } from '#utils/restRequest';

import { PartialActivityItem } from '../../schema';
import styles from './styles.module.css';

type Options = GoApiResponse<'/api/v2/emergency-project/options/'>;

type Props = {
    clientId: string;
    mainIndex: number;
    onChange: (value: SetValueArg<PartialActivityItem>, index: number) => void;
    sectorKey: number;
    value: PartialActivityItem;
} & ({
    type: 'custom';
    handleRemoveClick: (clientId: string) => void;
    itemNumber: number;
    actionDetails?: undefined;
} | {
    type: 'action';
    itemNumber?: undefined;
    actionDetails: Options['actions'][number] | undefined;
    handleRemoveClick?: undefined;
});

function ActivityInput(props: Props) {
    const {
        clientId,
        itemNumber,
        mainIndex,
        actionDetails,
        handleRemoveClick,
        onChange,
        sectorKey,
        value,
        type,
    } = props;

    const setFieldValue = useFormObject(mainIndex, onChange, {
        client_id: randomString(),
        action: actionDetails?.id,
        sector: sectorKey,
    });

    return (
        <ExpandableContainer
            className={styles.activityInput}
            headingLevel={4}
            spacing="compact"
            actions={type === 'custom' && (
                <Button
                    name={clientId}
                    onClick={handleRemoveClick}
                    variant="secondary"
                    icons={(
                        <DeleteBinLineIcon />
                    )}
                >
                    Delete
                </Button>
            )}
            heading={type === 'custom' ? `Custom Activity #${itemNumber}` : actionDetails?.title}
            withHeaderBorder
        >
            {type === 'custom' && (
                <TextInput
                    value={value?.custom_action}
                    name="custom_action"
                    onChange={setFieldValue}
                    label="Activity Title"
                />
            )}
            <TextArea
                value={value?.details}
                name="details"
                onChange={setFieldValue}
                label="Activity Details"
            />
        </ExpandableContainer>
    );
}

export default ActivityInput;
