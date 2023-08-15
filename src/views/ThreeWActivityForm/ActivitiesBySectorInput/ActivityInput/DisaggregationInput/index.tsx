import {
    sum,
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    ObjectError,
    EntriesAsList,
} from '@togglecorp/toggle-form';

import NumberOutput from '#components/NumberOutput';
import NumberInput from '#components/NumberInput';
import Switch from '#components/parked/Switch';

import {
    PartialActivityItem,
} from '../../../schema';

import styles from './styles.module.css';

interface Props {
    value: PartialActivityItem;
    setFieldValue: (...entries: EntriesAsList<PartialActivityItem>) => void;
    error?: ObjectError<PartialActivityItem>;
}

function DisaggregationInput(props: Props) {
    const {
        value,
        setFieldValue,
        error,
    } = props;

    const total_0_1_count = sum(
        [
            value?.male_0_1_count,
            value?.female_0_1_count,
            value?.other_0_1_count,
        ].filter(isDefined),
    );

    const total_2_5_count = sum(
        [
            value?.male_2_5_count,
            value?.female_2_5_count,
            value?.other_2_5_count,
        ].filter(isDefined),
    );

    const total_6_12_count = sum(
        [
            value?.male_6_12_count,
            value?.female_6_12_count,
            value?.other_6_12_count,
        ].filter(isDefined),
    );

    const total_13_17_count = sum(
        [
            value?.male_13_17_count,
            value?.female_13_17_count,
            value?.other_13_17_count,
        ].filter(isDefined),
    );

    const total_18_59_count = sum(
        [
            value?.male_18_59_count,
            value?.female_18_59_count,
            value?.other_18_59_count,
        ].filter(isDefined),
    );

    const total_60_plus_count = sum(
        [
            value?.male_60_plus_count,
            value?.female_60_plus_count,
            value?.other_60_plus_count,
        ].filter(isDefined),
    );

    const total_unknown = sum(
        [
            value?.male_unknown_age_count,
            value?.female_unknown_age_count,
            value?.other_unknown_age_count,
        ].filter(isDefined),
    );

    const total_male = sum(
        [
            value?.male_0_1_count,
            value?.male_2_5_count,
            value?.male_6_12_count,
            value?.male_13_17_count,
            value?.male_18_59_count,
            value?.male_60_plus_count,
            value?.male_unknown_age_count,
        ].filter(isDefined),
    );

    const total_female = sum(
        [
            value?.female_0_1_count,
            value?.female_2_5_count,
            value?.female_6_12_count,
            value?.female_13_17_count,
            value?.female_18_59_count,
            value?.female_60_plus_count,
            value?.female_unknown_age_count,
        ].filter(isDefined),
    );

    const total_other = sum(
        [
            value?.other_0_1_count,
            value?.other_2_5_count,
            value?.other_6_12_count,
            value?.other_13_17_count,
            value?.other_18_59_count,
            value?.other_60_plus_count,
            value?.other_unknown_age_count,
        ].filter(isDefined),
    );

    const total = sum(
        [
            total_male,
            total_female,
            total_other,
        ].filter(isDefined),
    );

    const disabled_total_0_1_count = sum(
        [
            value?.disabled_male_0_1_count,
            value?.disabled_female_0_1_count,
            value?.disabled_other_0_1_count,
        ].filter(isDefined),
    );

    const disabled_total_2_5_count = sum(
        [
            value?.disabled_male_2_5_count,
            value?.disabled_female_2_5_count,
            value?.disabled_other_2_5_count,
        ].filter(isDefined),
    );

    const disabled_total_6_12_count = sum(
        [
            value?.disabled_male_6_12_count,
            value?.disabled_female_6_12_count,
            value?.disabled_other_6_12_count,
        ].filter(isDefined),
    );

    const disabled_total_13_17_count = sum(
        [
            value?.disabled_male_13_17_count,
            value?.disabled_female_13_17_count,
            value?.disabled_other_13_17_count,
        ].filter(isDefined),
    );

    const disabled_total_18_59_count = sum(
        [
            value?.disabled_male_18_59_count,
            value?.disabled_female_18_59_count,
            value?.disabled_other_18_59_count,
        ].filter(isDefined),
    );

    const disabled_total_60_plus_count = sum(
        [
            value?.disabled_male_60_plus_count,
            value?.disabled_female_60_plus_count,
            value?.disabled_other_60_plus_count,
        ].filter(isDefined),
    );

    const disabled_total_unknown = sum(
        [
            value?.disabled_male_unknown_age_count,
            value?.disabled_female_unknown_age_count,
            value?.disabled_other_unknown_age_count,
        ].filter(isDefined),
    );

    const disabled_total_male = sum(
        [
            value?.disabled_male_0_1_count,
            value?.disabled_male_2_5_count,
            value?.disabled_male_6_12_count,
            value?.disabled_male_13_17_count,
            value?.disabled_male_18_59_count,
            value?.disabled_male_60_plus_count,
            value?.disabled_male_unknown_age_count,
        ].filter(isDefined),
    );

    const disabled_total_female = sum(
        [
            value?.disabled_female_0_1_count,
            value?.disabled_female_2_5_count,
            value?.disabled_female_6_12_count,
            value?.disabled_female_13_17_count,
            value?.disabled_female_18_59_count,
            value?.disabled_female_60_plus_count,
            value?.disabled_female_unknown_age_count,
        ].filter(isDefined),
    );

    const disabled_total_other = sum(
        [
            value?.disabled_other_0_1_count,
            value?.disabled_other_2_5_count,
            value?.disabled_other_6_12_count,
            value?.disabled_other_13_17_count,
            value?.disabled_other_18_59_count,
            value?.disabled_other_60_plus_count,
            value?.disabled_other_unknown_age_count,
        ].filter(isDefined),
    );

    const disabled_total = sum(
        [
            disabled_total_male,
            disabled_total_female,
            disabled_total_other,
        ].filter(isDefined),
    );
    return (
        <div className={styles.detailedReporting}>
            <div className={styles.tableContainer}>
                <div className={styles.row}>
                    <div className={styles.header}>
                        Gender/Age
                    </div>
                    <div className={styles.header}>
                        0-1
                    </div>
                    <div className={styles.header}>
                        2-5
                    </div>
                    <div className={styles.header}>
                        6-12
                    </div>
                    <div className={styles.header}>
                        13-17
                    </div>
                    <div className={styles.header}>
                        18-59
                    </div>
                    <div className={styles.header}>
                        60+
                    </div>
                    <div className={styles.header}>
                        Unknown
                    </div>
                    <div className={styles.header}>
                        Total
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={_cs(styles.cell, styles.header)}>
                        Male
                    </div>
                    <NumberInput
                        className={styles.cell}
                        inputSectionClassName={styles.inputSection}
                        name="male_0_1_count"
                        onChange={setFieldValue}
                        value={value?.male_0_1_count}
                        error={error?.male_0_1_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="male_2_5_count"
                        value={value?.male_2_5_count}
                        error={error?.male_2_5_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="male_6_12_count"
                        value={value?.male_6_12_count}
                        error={error?.male_6_12_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="male_13_17_count"
                        value={value?.male_13_17_count}
                        error={error?.male_13_17_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="male_18_59_count"
                        value={value?.male_18_59_count}
                        error={error?.male_18_59_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="male_60_plus_count"
                        value={value?.male_60_plus_count}
                        error={error?.male_60_plus_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="male_unknown_age_count"
                        value={value?.male_unknown_age_count}
                        error={error?.male_unknown_age_count}
                    />
                    <NumberOutput
                        className={_cs(styles.cell, styles.output)}
                        value={total_male}
                    />
                </div>
                <div className={styles.row}>
                    <div className={_cs(styles.cell, styles.header)}>
                        Female
                    </div>
                    <NumberInput
                        className={styles.cell}
                        name="female_0_1_count"
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        value={value?.female_0_1_count}
                        error={error?.female_0_1_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="female_2_5_count"
                        value={value?.female_2_5_count}
                        error={error?.female_2_5_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="female_6_12_count"
                        value={value?.female_6_12_count}
                        error={error?.female_6_12_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="female_13_17_count"
                        value={value?.female_13_17_count}
                        error={error?.female_13_17_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="female_18_59_count"
                        value={value?.female_18_59_count}
                        error={error?.female_18_59_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="female_60_plus_count"
                        value={value?.female_60_plus_count}
                        error={error?.female_60_plus_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="female_unknown_age_count"
                        value={value?.female_unknown_age_count}
                        error={error?.female_unknown_age_count}
                    />
                    <NumberOutput
                        className={_cs(styles.cell, styles.output)}
                        value={total_female}
                    />
                </div>
                <div className={styles.row}>
                    <div className={_cs(styles.cell, styles.header)}>
                        Other
                    </div>
                    <NumberInput
                        className={styles.cell}
                        name="other_0_1_count"
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        value={value?.other_0_1_count}
                        error={error?.other_0_1_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="other_2_5_count"
                        value={value?.other_2_5_count}
                        error={error?.other_2_5_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="other_6_12_count"
                        value={value?.other_6_12_count}
                        error={error?.other_6_12_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="other_13_17_count"
                        value={value?.other_13_17_count}
                        error={error?.other_13_17_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="other_18_59_count"
                        value={value?.other_18_59_count}
                        error={error?.other_18_59_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="other_60_plus_count"
                        value={value?.other_60_plus_count}
                        error={error?.other_60_plus_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="other_unknown_age_count"
                        value={value?.other_unknown_age_count}
                        error={error?.other_unknown_age_count}
                    />
                    <NumberOutput
                        className={_cs(styles.cell, styles.output)}
                        value={total_other}
                    />
                </div>
                <div className={styles.row}>
                    <div className={_cs(styles.cell, styles.header)}>
                        Total
                    </div>
                    <NumberOutput
                        className={_cs(styles.cell, styles.output)}
                        value={total_0_1_count}
                    />
                    <NumberOutput
                        className={_cs(styles.cell, styles.output)}
                        value={total_2_5_count}
                    />
                    <NumberOutput
                        className={_cs(styles.cell, styles.output)}
                        value={total_6_12_count}
                    />
                    <NumberOutput
                        className={_cs(styles.cell, styles.output)}
                        value={total_13_17_count}
                    />
                    <NumberOutput
                        className={_cs(styles.cell, styles.output)}
                        value={total_18_59_count}
                    />
                    <NumberOutput
                        className={_cs(styles.cell, styles.output)}
                        value={total_60_plus_count}
                    />
                    <NumberOutput
                        className={_cs(styles.cell, styles.output)}
                        value={total_unknown}
                    />
                    <NumberOutput
                        className={_cs(styles.cell, styles.output)}
                        value={total}
                    />
                </div>
            </div>
            <Switch
                label="Disaggregation for disabled available"
                name="is_disaggregated_for_disabled"
                value={!!value?.is_disaggregated_for_disabled}
                onChange={setFieldValue}
                error={error?.is_disaggregated_for_disabled}
            />
            {value?.is_disaggregated_for_disabled && (
                <div className={styles.tableContainer}>
                    <div className={styles.row}>
                        <div className={styles.header}>
                            Gender/Age
                        </div>
                        <div className={styles.header}>
                            0-1
                        </div>
                        <div className={styles.header}>
                            2-5
                        </div>
                        <div className={styles.header}>
                            6-12
                        </div>
                        <div className={styles.header}>
                            13-17
                        </div>
                        <div className={styles.header}>
                            18-59
                        </div>
                        <div className={styles.header}>
                            60+
                        </div>
                        <div className={styles.header}>
                            Unknown
                        </div>
                        <div className={styles.header}>
                            Total
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={_cs(styles.cell, styles.header)}>
                            Male
                        </div>
                        <NumberInput
                            className={styles.cell}
                            name="disabled_male_0_1_count"
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            value={value?.disabled_male_0_1_count}
                            error={error?.disabled_male_0_1_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_male_2_5_count"
                            value={value?.disabled_male_2_5_count}
                            error={error?.disabled_male_2_5_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_male_6_12_count"
                            value={value?.disabled_male_6_12_count}
                            error={error?.disabled_male_6_12_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_male_13_17_count"
                            value={value?.disabled_male_13_17_count}
                            error={error?.disabled_male_13_17_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_male_18_59_count"
                            value={value?.disabled_male_18_59_count}
                            error={error?.disabled_male_18_59_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_male_60_plus_count"
                            value={value?.disabled_male_60_plus_count}
                            error={error?.disabled_male_60_plus_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_male_unknown_age_count"
                            value={value?.disabled_male_unknown_age_count}
                            error={error?.disabled_male_unknown_age_count}
                        />
                        <NumberOutput
                            className={_cs(styles.cell, styles.output)}
                            value={disabled_total_male}
                        />
                    </div>
                    <div className={styles.row}>
                        <div className={_cs(styles.cell, styles.header)}>
                            Female
                        </div>
                        <NumberInput
                            className={styles.cell}
                            name="disabled_female_0_1_count"
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            value={value?.disabled_female_0_1_count}
                            error={error?.disabled_female_0_1_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_female_2_5_count"
                            value={value?.disabled_female_2_5_count}
                            error={error?.disabled_female_2_5_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_female_6_12_count"
                            value={value?.disabled_female_6_12_count}
                            error={error?.disabled_female_6_12_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_female_13_17_count"
                            value={value?.disabled_female_13_17_count}
                            error={error?.disabled_female_13_17_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_female_18_59_count"
                            value={value?.disabled_female_18_59_count}
                            error={error?.disabled_female_18_59_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_female_60_plus_count"
                            value={value?.disabled_female_60_plus_count}
                            error={error?.disabled_female_60_plus_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_female_unknown_age_count"
                            value={value?.disabled_female_unknown_age_count}
                            error={error?.disabled_female_unknown_age_count}
                        />
                        <NumberOutput
                            className={_cs(styles.cell, styles.output)}
                            value={disabled_total_female}
                        />
                    </div>
                    <div className={styles.row}>
                        <div className={_cs(styles.cell, styles.header)}>
                            Other
                        </div>
                        <NumberInput
                            className={styles.cell}
                            name="disabled_other_0_1_count"
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            value={value?.disabled_other_0_1_count}
                            error={error?.disabled_other_0_1_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_other_2_5_count"
                            value={value?.disabled_other_2_5_count}
                            error={error?.disabled_other_2_5_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_other_6_12_count"
                            value={value?.disabled_other_6_12_count}
                            error={error?.disabled_other_6_12_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_other_13_17_count"
                            value={value?.disabled_other_13_17_count}
                            error={error?.disabled_other_13_17_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_other_18_59_count"
                            value={value?.disabled_other_18_59_count}
                            error={error?.disabled_other_18_59_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_other_60_plus_count"
                            value={value?.disabled_other_60_plus_count}
                            error={error?.disabled_other_60_plus_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_other_unknown_age_count"
                            value={value?.disabled_other_unknown_age_count}
                            error={error?.disabled_other_unknown_age_count}
                        />
                        <NumberOutput
                            className={_cs(styles.cell, styles.output)}
                            value={disabled_total_other}
                        />
                    </div>
                    <div className={styles.row}>
                        <div className={_cs(styles.cell, styles.header)}>
                            Total
                        </div>
                        <NumberOutput
                            className={_cs(styles.cell, styles.output)}
                            value={disabled_total_0_1_count}
                        />
                        <NumberOutput
                            className={_cs(styles.cell, styles.output)}
                            value={disabled_total_2_5_count}
                        />
                        <NumberOutput
                            className={_cs(styles.cell, styles.output)}
                            value={disabled_total_6_12_count}
                        />
                        <NumberOutput
                            className={_cs(styles.cell, styles.output)}
                            value={disabled_total_13_17_count}
                        />
                        <NumberOutput
                            className={_cs(styles.cell, styles.output)}
                            value={disabled_total_18_59_count}
                        />
                        <NumberOutput
                            className={_cs(styles.cell, styles.output)}
                            value={disabled_total_60_plus_count}
                        />
                        <NumberOutput
                            className={_cs(styles.cell, styles.output)}
                            value={disabled_total_unknown}
                        />
                        <NumberOutput
                            className={_cs(styles.cell, styles.output)}
                            value={disabled_total}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default DisaggregationInput;
