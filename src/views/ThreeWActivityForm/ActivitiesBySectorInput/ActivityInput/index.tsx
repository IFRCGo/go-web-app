import { useCallback } from 'react';
import {
    DeleteBinLineIcon,
    AddLineIcon,
} from '@ifrc-go/icons';
import {
    randomString,
    isTruthy,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    Error,
    useFormArray,
    getErrorObject,
    getErrorString,
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import ExpandableContainer from '#components/ExpandableContainer';
import Container from '#components/Container';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import Switch from '#components/parked/Switch';
import InputSection from '#components/InputSection';
import RadioInput from '#components/RadioInput';
import NumberInput from '#components/NumberInput';
import Button from '#components/Button';
import TextInput from '#components/TextInput';
import NonFieldError from '#components/NonFieldError';
import TextArea from '#components/TextArea';
import type { GoApiResponse } from '#utils/restRequest';
import type { GlobalEnums } from '#contexts/domain';

import {
    PartialActivityItem,
    PartialCustomSupplyItem,
    PartialActionSupplyItem,
    PartialPointItem,
} from '../../schema';
import DisaggregationInput from './DisaggregationInput';
import PointInput from './PointInput';
import CustomSupplyInput from './CustomSuppliesInput';
import ActionSupplyInput from './ActionSupplyInput';
import styles from './styles.module.css';

type Options = GoApiResponse<'/api/v2/emergency-project/options/'>;
const peopleHouseholdsKeySelector = (
    item: NonNullable<GlobalEnums['deployments_emergency_project_activity_people_households']>[number],
) => item.key;
const peopleHouseholdsLabelSelector = (
    item: NonNullable<GlobalEnums['deployments_emergency_project_activity_people_households']>[number],
) => item.value;

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

    const setFieldValue = useFormObject(mainIndex, onChange, () => ({
        client_id: randomString(),
        action: actionDetails?.id,
        sector: sectorKey,
    }));

    const {
        deployments_emergency_project_activity_people_households: peopleHouseholdOptions,
    } = useGlobalEnums();

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
        (
            value?.is_simplified_report
            && type === 'custom'
        ) || (
            value?.is_simplified_report
            && type === 'action'
            && !actionDetails?.is_cash_type
            && actionDetails?.has_location
        )
    );

    const locationsInputShown = (
        (
            !value?.is_simplified_report
            && type === 'custom'
        ) || (
            !value?.is_simplified_report
            && type === 'action'
            && !actionDetails?.is_cash_type
            && actionDetails?.has_location
        )
    );

    const customSupplyInputShown = (
        type === 'custom'
        || (type === 'action' && !actionDetails?.is_cash_type)
    );

    const actionSupplyInputShown = (
        type === 'action'
        && !actionDetails?.is_cash_type
        && (actionDetails?.supplies_details?.length ?? 0) > 0
    );

    const budgetInputsShown = (
        type === 'action'
        && actionDetails?.is_cash_type
    );

    // FIXME: Write this condition appropriately
    // This should be shown only if data is not filled
    // by the user
    const showNoDataAvailable = error?.has_no_data_on_people_reached
    || value?.has_no_data_on_people_reached;

    const {
        setValue: setPoint,
        removeValue: removePoint,
    } = useFormArray<'points', PartialPointItem>(
        'points',
        setFieldValue,
    );

    const handleAddPointButtonClick = useCallback(() => {
        onChange((oldValues) => {
            const points = [
                ...(oldValues?.points ?? []),
                {
                    client_id: randomString(),
                },
            ];
            return ({
                ...oldValues,
                client_id: oldValues?.client_id ?? randomString(),
                points,
            });
        }, mainIndex);
    }, [onChange, mainIndex]);

    const {
        setValue: setCustomSupply,
        removeValue: removeCustomSupply,
    } = useFormArray<'custom_supplies', PartialCustomSupplyItem>(
        'custom_supplies',
        setFieldValue,
    );

    const handleAddCustomSupplyClick = useCallback(() => {
        onChange((oldValues) => {
            const newSupplies = [
                ...(oldValues?.custom_supplies ?? []),
                {
                    client_id: randomString(),
                },
            ];
            return ({
                ...oldValues,
                client_id: oldValues?.client_id ?? randomString(),
                custom_supplies: newSupplies,
            });
        }, mainIndex);
    }, [onChange, mainIndex]);

    const {
        setValue: setActionSupply,
        removeValue: removeActionSupply,
    } = useFormArray<'supplies', PartialActionSupplyItem>(
        'supplies',
        setFieldValue,
    );

    const handleAddActionSupplyClick = useCallback(() => {
        onChange((oldValues) => {
            const newSupplies = [
                ...(oldValues?.supplies ?? []),
                {
                    client_id: randomString(),
                },
            ];
            return ({
                ...oldValues,
                client_id: oldValues?.client_id ?? randomString(),
                supplies: newSupplies,
            });
        }, mainIndex);
    }, [onChange, mainIndex]);

    return (
        <ExpandableContainer
            className={styles.activityInput}
            headingLevel={4}
            headingClassName={errorFromProps && styles.error}
            spacing="compact"
            actions={type === 'custom' && (
                <Button
                    name={clientId}
                    onClick={handleRemoveClick}
                    variant="secondary"
                    // FIXME: Add translations
                    title="Delete activity"
                    icons={(
                        <DeleteBinLineIcon />
                    )}
                >
                    {/* FIXME: Add translations */}
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
                        // FIXME: Add translations
                        label="Activity Title"
                        error={error?.custom_action}
                    />
                )}
                {showNoDataAvailable && (
                    <Switch
                        // FIXME: Add translations
                        label="No data on people reached"
                        name="has_no_data_on_people_reached"
                        value={!!value?.has_no_data_on_people_reached}
                        onChange={setFieldValue}
                        error={error?.has_no_data_on_people_reached}
                    />
                )}
                <Switch
                    // FIXME: Add translations
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
                        keySelector={peopleHouseholdsKeySelector}
                        labelSelector={peopleHouseholdsLabelSelector}
                        error={error?.people_households}
                    />
                )}
                {value?.is_simplified_report && value?.people_households === 'households' && (
                    <NumberInput
                        name="household_count"
                        // FIXME: Add translations
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
                            // FIXME: Add translations
                            label="People"
                            value={value?.people_count}
                            onChange={setFieldValue}
                            error={error?.people_count}
                            disabled={peopleCountDisabled}
                        />
                        OR
                        <NumberInput
                            name="male_count"
                            // FIXME: Add translations
                            label="Male"
                            value={value?.male_count}
                            onChange={handleMaleCountChange}
                            error={error?.male_count}
                            disabled={genderDisaggregationDisabled}
                        />
                        <NumberInput
                            name="female_count"
                            // FIXME: Add translations
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
                {budgetInputsShown && (
                    <div className={styles.cashInput}>
                        <NumberInput
                            // FIXME: Add translations
                            label="Number of Beneficiaries"
                            name="beneficiaries_count"
                            value={value?.beneficiaries_count}
                            onChange={setFieldValue}
                            error={error?.beneficiaries_count}
                        />
                        <NumberInput
                            // FIXME: Add translations
                            label="Amount in CHF"
                            name="amount"
                            value={value?.amount}
                            onChange={setFieldValue}
                            error={error?.amount}
                        />
                    </div>
                )}

                {pointCountInputShown && (
                    <NumberInput
                        name="point_count"
                        // FIXME: Add translations
                        label="No of Locations"
                        onChange={setFieldValue}
                        value={value?.point_count}
                        error={error?.point_count}
                    />
                )}
                {locationsInputShown && (
                    <Container
                        className={styles.customLocations}
                        // FIXME: Add translations
                        heading="Locations"
                        actions={(
                            <Button
                                name={undefined}
                                variant="secondary"
                                icons={(
                                    <AddLineIcon />
                                )}
                                // FIXME: Add translations
                                title="Add locations"
                                onClick={handleAddPointButtonClick}
                            >
                                {/* FIXME: Add translations */}
                                Add Location
                            </Button>

                        )}
                    >
                        {value?.points?.map((p, i) => (
                            <PointInput
                                index={i}
                                key={p.client_id}
                                value={p}
                                onChange={setPoint}
                                error={getErrorObject(error?.points)}
                                onRemove={removePoint}
                            />
                        ))}

                    </Container>
                )}
                {actionSupplyInputShown && (
                    <Container
                        className={styles.actionSupplies}
                        // FIXME: Add translations
                        heading="Supplies"
                        actions={(
                            <Button
                                name={undefined}
                                variant="secondary"
                                icons={(
                                    <AddLineIcon />
                                )}
                                onClick={handleAddActionSupplyClick}
                            >
                                {/* FIXME: Add translations */}
                                Add Action Supply
                            </Button>

                        )}
                    >
                        <NonFieldError error={getErrorString(error?.supplies)} />
                        {value?.supplies?.map((p, i) => (
                            <ActionSupplyInput
                                index={i}
                                key={p.client_id}
                                value={p}
                                options={actionDetails?.supplies_details}
                                error={getErrorObject(error?.supplies)}
                                onChange={setActionSupply}
                                onRemove={removeActionSupply}
                            />
                        ))}
                    </Container>
                )}
                {customSupplyInputShown && (
                    <Container
                        className={styles.customSupplies}
                        // FIXME: Add translations
                        heading="Custom Supplies"
                        actions={(
                            <Button
                                name={undefined}
                                variant="secondary"
                                icons={(
                                    <AddLineIcon />
                                )}
                                // FIXME: Add translations
                                title="Add custom supply"
                                onClick={handleAddCustomSupplyClick}
                            >
                                {/* FIXME: Add translations */}
                                Add Custom Supply
                            </Button>

                        )}
                    >
                        <NonFieldError error={getErrorString(error?.custom_supplies)} />
                        {value?.custom_supplies?.map((p, i) => (
                            <CustomSupplyInput
                                index={i}
                                key={p.client_id}
                                value={p}
                                error={getErrorObject(error?.custom_supplies)}
                                onChange={setCustomSupply}
                                onRemove={removeCustomSupply}
                            />
                        ))}

                    </Container>
                )}
                <TextArea
                    value={value?.details}
                    name="details"
                    onChange={setFieldValue}
                    // FIXME: Add translations
                    label="Activity Details"
                    error={error?.details}
                />
            </InputSection>
        </ExpandableContainer>
    );
}

export default ActivityInput;
