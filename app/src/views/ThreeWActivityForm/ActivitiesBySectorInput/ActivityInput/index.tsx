import { useCallback } from 'react';
import {
    AddLineIcon,
    DeleteBinLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    ExpandableContainer,
    InputSection,
    NumberInput,
    RadioInput,
    Switch,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { DEFAULT_INVALID_TEXT } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isTruthy,
    randomString,
} from '@togglecorp/fujs';
import {
    type Error,
    getErrorObject,
    getErrorString,
    type SetValueArg,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import { type GlobalEnums } from '#contexts/domain';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { type GoApiResponse } from '#utils/restRequest';

import {
    type PartialActionSupplyItem,
    type PartialActivityItem,
    type PartialCustomSupplyItem,
    type PartialPointItem,
} from '../../schema';
import ActionSupplyInput from './ActionSupplyInput';
import CustomSupplyInput from './CustomSuppliesInput';
import DisaggregationInput from './DisaggregationInput';
import PointInput from './PointInput';

import i18n from './i18n.json';
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
    disabled?: boolean;
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
        disabled,
    } = props;

    const strings = useTranslation(i18n);

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
            childrenContainerClassName={styles.content}
            headingLevel={5}
            headingClassName={errorFromProps && styles.error}
            spacing="cozy"
            actions={type === 'custom' && (
                <Button
                    name={clientId}
                    onClick={handleRemoveClick}
                    variant="secondary"
                    title={strings.deleteActivityTitle}
                    disabled={disabled}
                    icons={(
                        <DeleteBinLineIcon />
                    )}
                >
                    {strings.deleteButton}
                </Button>
            )}
            heading={type === 'custom' ? `${strings.customActivityHeading} #${itemNumber}` : actionDetails?.title}
            withHeaderBorder
        >
            <NonFieldError error={error} />
            <InputSection
                description={actionDetails?.description || DEFAULT_INVALID_TEXT}
                withoutPadding
            >
                <div className={styles.inputSectionContent}>
                    {type === 'custom' && (
                        <TextInput
                            value={value?.custom_action}
                            name="custom_action"
                            onChange={setFieldValue}
                            label={strings.activityTitleLabel}
                            disabled={disabled}
                            error={error?.custom_action}
                        />
                    )}
                    <Switch
                        label={strings.detailedReportingLabel}
                        name="is_simplified_report"
                        value={value?.is_simplified_report}
                        disabled={disabled}
                        onChange={setFieldValue}
                        error={error?.is_simplified_report}
                        invertedLogic
                    />
                    {value?.is_simplified_report && (
                        <RadioInput
                            name="people_households"
                            value={value?.people_households}
                            disabled={disabled}
                            onChange={setFieldValue}
                            options={peopleHouseholdOptions}
                            listContainerClassName={styles.radio}
                            keySelector={peopleHouseholdsKeySelector}
                            labelSelector={peopleHouseholdsLabelSelector}
                            error={error?.people_households}
                            withAsterisk
                        />
                    )}
                    {value?.is_simplified_report && value?.people_households === 'households' && (
                        <NumberInput
                            name="household_count"
                            label={strings.householdsCountLabel}
                            value={value?.household_count}
                            disabled={disabled}
                            onChange={setFieldValue}
                            error={error?.household_count}
                        />
                    )}
                    {value?.is_simplified_report && value?.people_households === 'people' && (
                        <div className={styles.row}>
                            <NumberInput
                                name="people_count"
                                label={strings.peopleCountLabel}
                                value={value?.people_count}
                                onChange={setFieldValue}
                                error={error?.people_count}
                                disabled={peopleCountDisabled || disabled}
                            />
                            {strings.rowOrLabel}
                            <NumberInput
                                name="male_count"
                                label={strings.maleCountLabel}
                                value={value?.male_count}
                                onChange={handleMaleCountChange}
                                error={error?.male_count}
                                disabled={genderDisaggregationDisabled || disabled}
                            />
                            <NumberInput
                                name="female_count"
                                label={strings.femaleCountLabel}
                                value={value?.female_count}
                                onChange={handleFemaleCountChange}
                                error={error?.female_count}
                                disabled={genderDisaggregationDisabled || disabled}
                            />
                        </div>
                    )}
                    {!value?.is_simplified_report && (
                        <DisaggregationInput
                            value={value}
                            disabled={disabled}
                            error={error}
                            setFieldValue={setFieldValue}
                        />
                    )}
                    {(
                        // NOTE: This should be shown only if data is not filled by the user
                        error?.has_no_data_on_people_reached
                        || value?.has_no_data_on_people_reached
                    ) && (
                        <Switch
                            label={strings.peopleReachedLabel}
                            name="has_no_data_on_people_reached"
                            value={value?.has_no_data_on_people_reached}
                            disabled={disabled}
                            onChange={setFieldValue}
                            error={error?.has_no_data_on_people_reached}
                        />
                    )}
                    {(
                        type === 'action'
                        && actionDetails?.is_cash_type
                    ) && (
                        <div className={styles.cashInput}>
                            <NumberInput
                                label={strings.beneficiariesCountLabel}
                                name="beneficiaries_count"
                                value={value?.beneficiaries_count}
                                onChange={setFieldValue}
                                disabled={disabled}
                                error={error?.beneficiaries_count}
                            />
                            <NumberInput
                                label={strings.amountLabel}
                                name="amount"
                                value={value?.amount}
                                disabled={disabled}
                                onChange={setFieldValue}
                                error={error?.amount}
                            />
                        </div>
                    )}

                    {value?.is_simplified_report && (
                        type === 'custom'
                        || (type === 'action' && !actionDetails?.is_cash_type && actionDetails?.has_location)
                    ) && (
                        <NumberInput
                            name="point_count"
                            label={strings.pointCountLabel}
                            onChange={setFieldValue}
                            value={value?.point_count}
                            disabled={disabled}
                            error={error?.point_count}
                        />
                    )}
                    {!value?.is_simplified_report && (
                        type === 'custom'
                        || (type === 'action' && !actionDetails?.is_cash_type && actionDetails?.has_location)
                    ) && (
                        <Container
                            className={styles.customLocations}
                            heading={strings.locationsContainerHeading}
                            actions={(
                                <Button
                                    name={undefined}
                                    disabled={disabled}
                                    variant="secondary"
                                    icons={(
                                        <AddLineIcon />
                                    )}
                                    title={strings.locationsButtonTitle}
                                    onClick={handleAddPointButtonClick}
                                >
                                    {strings.addLocationButtonLabel}
                                </Button>

                            )}
                        >
                            <NonFieldError error={getErrorObject(error?.points)} />
                            {value?.points?.map((point, index) => (
                                <PointInput
                                    index={index}
                                    key={point.client_id}
                                    value={point}
                                    disabled={disabled}
                                    onChange={setPoint}
                                    error={getErrorObject(error?.points)}
                                    onRemove={removePoint}
                                />
                            ))}

                        </Container>
                    )}
                    {(
                        type === 'action'
                        && !actionDetails?.is_cash_type
                        && (actionDetails?.supplies_details?.length ?? 0) > 0
                    ) && (
                        <Container
                            className={styles.actionSupplies}
                            heading={strings.suppliesContainerHeading}
                            actions={(
                                <Button
                                    name={undefined}
                                    variant="secondary"
                                    disabled={disabled}
                                    icons={(
                                        <AddLineIcon />
                                    )}
                                    onClick={handleAddActionSupplyClick}
                                >
                                    {strings.addActionButtonLabel}
                                </Button>
                            )}
                        >
                            <NonFieldError error={getErrorString(error?.supplies)} />
                            {value?.supplies?.map((p, i) => (
                                <ActionSupplyInput
                                    index={i}
                                    key={p.client_id}
                                    value={p}
                                    disabled={disabled}
                                    options={actionDetails?.supplies_details}
                                    error={getErrorObject(error?.supplies)}
                                    onChange={setActionSupply}
                                    onRemove={removeActionSupply}
                                />
                            ))}
                        </Container>
                    )}
                    {(
                        type === 'custom'
                        || (type === 'action' && !actionDetails?.is_cash_type)
                    ) && (
                        <Container
                            className={styles.customSupplies}
                            heading={strings.customSuppliesContainerHeading}
                            actions={(
                                <Button
                                    name={undefined}
                                    variant="secondary"
                                    disabled={disabled}
                                    icons={(
                                        <AddLineIcon />
                                    )}
                                    title={strings.addCustomSupplyButtonTitle}
                                    onClick={handleAddCustomSupplyClick}
                                >
                                    {strings.addCustomSupplyButtonTitle}
                                </Button>
                            )}
                        >
                            <NonFieldError error={getErrorString(error?.custom_supplies)} />
                            {value?.custom_supplies?.map((p, i) => (
                                <CustomSupplyInput
                                    index={i}
                                    key={p.client_id}
                                    value={p}
                                    disabled={disabled}
                                    error={getErrorObject(error?.custom_supplies)}
                                    onChange={setCustomSupply}
                                    onRemove={removeCustomSupply}
                                />
                            ))}

                        </Container>
                    )}
                    <TextArea
                        value={value?.details}
                        disabled={disabled}
                        name="details"
                        onChange={setFieldValue}
                        label={strings.activityDetailsLabel}
                        error={error?.details}
                    />
                </div>
            </InputSection>
        </ExpandableContainer>
    );
}

export default ActivityInput;
