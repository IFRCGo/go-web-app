import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    Container,
    IconButton,
    SelectInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import { type GoApiResponse } from '#utils/restRequest';

import { type PartialDref } from '../../../schema';

import i18n from './i18n.json';

type ProposedActionsFormFields = NonNullable<PartialDref['proposed_action']>[number];
type ActivitiesFormFields = NonNullable<ProposedActionsFormFields['activities']>[number];
type ActivityOptions = NonNullable<GoApiResponse<'/api/v2/primarysector'>>[number];

function sectorKeySelector(option: ActivityOptions) {
    return option.key;
}

function sectorLabelSelector(option: ActivityOptions) {
    return option.label;
}

const defaultActivitiesValue: ActivitiesFormFields = {
    client_id: '-1',
};

interface Props {
    value: ActivitiesFormFields;
    error: ArrayError<ActivitiesFormFields> | undefined;
    onChange: (value: SetValueArg<ActivitiesFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    activityOptions?: ActivityOptions[];
}
function ActivitiesInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
        activityOptions,
    } = props;

    const strings = useTranslation(i18n);

    const onFieldChange = useFormObject(index, onChange, defaultActivitiesValue);

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <Container
            numPreferredGridContentColumns={2}
            footerActions={(
                <IconButton
                    name={index}
                    onClick={onRemove}
                    title={strings.drefFormProposedActionRemoveSector}
                    ariaLabel={strings.drefFormProposedActionRemoveSector}
                    round={false}
                    variant="tertiary"
                    disabled={disabled}
                >
                    <DeleteBinLineIcon />
                </IconButton>
            )}
        >
            <SelectInput
                required
                name="sector"
                label={strings.drefFormProposedActionSector}
                options={activityOptions}
                keySelector={sectorKeySelector}
                labelSelector={sectorLabelSelector}
                error={error?.sector}
                onChange={onFieldChange}
                value={value.sector}
                readOnly
            />
            <TextArea
                label={strings.drefFormProposedActionsListOfActivities}
                name="activity"
                value={value.activity}
                onChange={onFieldChange}
                error={error?.activity}
                disabled={disabled}
                autoBullets
            />
        </Container>
    );
}

export default ActivitiesInput;
