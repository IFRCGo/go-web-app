import { useCallback } from 'react';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    randomString,
    isTruthy,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    Error,
    getErrorObject,
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import ExpandableContainer from '#components/ExpandableContainer';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import Switch from '#components/parked/Switch';
import InputSection from '#components/InputSection';
import RadioInput from '#components/RadioInput';
import NumberInput from '#components/NumberInput';
import Button from '#components/Button';
import TextInput from '#components/TextInput';
import TextArea from '#components/TextArea';
import type { GoApiResponse } from '#utils/restRequest';

import { PartialActivityItem } from '../../schema';
import DisaggregationInput from './DisaggregationInput';
import styles from './styles.module.css';

type Options = GoApiResponse<'/api/v2/emergency-project/options/'>;

function updateTotalCountChange(oldValue: PartialActivityItem): PartialActivityItem {
    if (
        isTruthy(oldValue?.male_count)
        || isTruthy(oldValue?.female_count)
    ) {
        const total = (oldValue.male_count ?? 0)
            + (oldValue.female_count ?? 0);

        return {
            ...oldValue,
            people_count: total,
        };
    }
    return oldValue;
}

type Props = {
    clientId: string;
    mainIndex: number;
    onChange: (value: SetValueArg<PartialActivityItem>, index: number) => void;
    error: Error<PartialActivityItem> | undefined;
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
        error: errorFromProps,
        value,
        type,
    } = props;

    const setFieldValue = useFormObject(mainIndex, onChange, {
        client_id: randomString(),
        action: actionDetails?.id,
        sector: sectorKey,
    });

    const {
        deployments_emergency_project_activity_people_households: peopleHouseholdOptions,
    } = useGlobalEnums();

    // FIXME: Write this condition appropriately
    // This should be shown only if data is not filled
    // by the user
    const showNoDataAvailable = true;
    const error = getErrorObject(errorFromProps);
    const peopleCountDisabled = isDefined(value?.male_count) || isDefined(value?.female_count);
    const genderDisaggregationDisabled = isDefined(value?.people_count)
        && isNotDefined(value?.male_count)
        && isNotDefined(value?.female_count);

    const handleMaleCountChange = useCallback((newCount: number | undefined) => {
        onChange((oldValue) => (
            updateTotalCountChange({
                ...oldValue,
                client_id: oldValue?.client_id ?? randomString(),
                male_count: newCount,
            })
        ), mainIndex);
    }, [onChange, mainIndex]);

    const handleFemaleCountChange = useCallback((newCount: number | undefined) => {
        onChange((oldValue) => (
            updateTotalCountChange({
                ...oldValue,
                client_id: oldValue?.client_id ?? randomString(),
                female_count: newCount,
            })
        ), mainIndex);
    }, [onChange, mainIndex]);

    const pointCountInputShown = (
        (value?.is_simplified_report && type === 'custom')
        || (
            value?.is_simplified_report
            && !actionDetails?.is_cash_type
            && actionDetails?.has_location
        )
    );

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
            <InputSection
                title={actionDetails?.description}
                contentSectionClassName={styles.inputSectionContent}
            >
                {type === 'custom' && (
                    <TextInput
                        value={value?.custom_action}
                        name="custom_action"
                        onChange={setFieldValue}
                        label="Activity Title"
                        error={error?.custom_action}
                    />
                )}
                {showNoDataAvailable && (
                    <Switch
                        label="No data on people reached"
                        name="has_no_data_on_people_reached"
                        value={!!value?.has_no_data_on_people_reached}
                        onChange={setFieldValue}
                        error={error?.has_no_data_on_people_reached}
                    />
                )}
                <Switch
                    label="Detailed Reporting"
                    name="is_simplified_report"
                    value={!!value?.is_simplified_report}
                    onChange={setFieldValue}
                    error={error?.is_simplified_report}
                    invertedLogic
                />
                {value?.is_simplified_report && (
                    <RadioInput
                        name="people_households"
                        value={value?.people_households}
                        onChange={setFieldValue}
                        options={peopleHouseholdOptions}
                        listContainerClassName={styles.radio}
                        // FIXME: do not use inline functions
                        keySelector={(d) => d.key}
                        labelSelector={(d) => d.value}
                        error={error?.people_households}
                    />
                )}
                {value?.is_simplified_report && value?.people_households === 'households' && (
                    <NumberInput
                        name="household_count"
                        label="Households"
                        value={value?.household_count}
                        onChange={setFieldValue}
                        error={error?.household_count}
                    />
                )}
                {value?.is_simplified_report && value?.people_households === 'people' && (
                    <div className={styles.row}>
                        <NumberInput
                            name="people_count"
                            label="People"
                            value={value?.people_count}
                            onChange={setFieldValue}
                            error={error?.people_count}
                            disabled={peopleCountDisabled}
                        />
                        OR
                        <NumberInput
                            name="male_count"
                            label="Male"
                            value={value?.male_count}
                            onChange={handleMaleCountChange}
                            error={error?.male_count}
                            disabled={genderDisaggregationDisabled}
                        />
                        <NumberInput
                            name="female_count"
                            label="Female"
                            value={value?.female_count}
                            onChange={handleFemaleCountChange}
                            error={error?.female_count}
                            disabled={genderDisaggregationDisabled}
                        />
                    </div>
                )}
                {!value?.is_simplified_report && (
                    <DisaggregationInput
                        value={value}
                        error={error}
                        setFieldValue={setFieldValue}
                    />
                )}
                {pointCountInputShown && (
                    <NumberInput
                        name="point_count"
                        label="No of Locations"
                        onChange={setFieldValue}
                        value={value?.point_count}
                        error={value?.point_count}
                    />
                )}
                <TextArea
                    value={value?.details}
                    name="details"
                    onChange={setFieldValue}
                    label="Activity Details"
                    error={error?.details}
                />
            </InputSection>
        </ExpandableContainer>
    );
}

export default ActivityInput;
