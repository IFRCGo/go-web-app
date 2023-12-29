import {
    NumberInput,
    NumberOutput,
    Switch,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { sumSafe } from '@ifrc-go/ui/utils';
import { _cs } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type ObjectError,
} from '@togglecorp/toggle-form';

import { type PartialActivityItem } from '../../../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    value: PartialActivityItem;
    setFieldValue: (...entries: EntriesAsList<PartialActivityItem>) => void;
    error?: ObjectError<PartialActivityItem>;
    disabled?: boolean;
}

function DisaggregationInput(props: Props) {
    const {
        value,
        setFieldValue,
        disabled,
        error,
    } = props;

    const strings = useTranslation(i18n);

    const total_0_1_count = sumSafe([
        value?.male_0_1_count,
        value?.female_0_1_count,
        value?.other_0_1_count,
    ]);

    const total_2_5_count = sumSafe([
        value?.male_2_5_count,
        value?.female_2_5_count,
        value?.other_2_5_count,
    ]);

    const total_6_12_count = sumSafe([
        value?.male_6_12_count,
        value?.female_6_12_count,
        value?.other_6_12_count,
    ]);

    const total_13_17_count = sumSafe([
        value?.male_13_17_count,
        value?.female_13_17_count,
        value?.other_13_17_count,
    ]);

    const total_18_59_count = sumSafe([
        value?.male_18_59_count,
        value?.female_18_59_count,
        value?.other_18_59_count,
    ]);

    const total_60_plus_count = sumSafe([
        value?.male_60_plus_count,
        value?.female_60_plus_count,
        value?.other_60_plus_count,
    ]);

    const total_unknown = sumSafe([
        value?.male_unknown_age_count,
        value?.female_unknown_age_count,
        value?.other_unknown_age_count,
    ]);

    const total_male = sumSafe([
        value?.male_0_1_count,
        value?.male_2_5_count,
        value?.male_6_12_count,
        value?.male_13_17_count,
        value?.male_18_59_count,
        value?.male_60_plus_count,
        value?.male_unknown_age_count,
    ]);

    const total_female = sumSafe([
        value?.female_0_1_count,
        value?.female_2_5_count,
        value?.female_6_12_count,
        value?.female_13_17_count,
        value?.female_18_59_count,
        value?.female_60_plus_count,
        value?.female_unknown_age_count,
    ]);

    const total_other = sumSafe([
        value?.other_0_1_count,
        value?.other_2_5_count,
        value?.other_6_12_count,
        value?.other_13_17_count,
        value?.other_18_59_count,
        value?.other_60_plus_count,
        value?.other_unknown_age_count,
    ]);

    const total = sumSafe([
        total_male,
        total_female,
        total_other,
    ]);

    const disabled_total_0_1_count = sumSafe([
        value?.disabled_male_0_1_count,
        value?.disabled_female_0_1_count,
        value?.disabled_other_0_1_count,
    ]);

    const disabled_total_2_5_count = sumSafe([
        value?.disabled_male_2_5_count,
        value?.disabled_female_2_5_count,
        value?.disabled_other_2_5_count,
    ]);

    const disabled_total_6_12_count = sumSafe([
        value?.disabled_male_6_12_count,
        value?.disabled_female_6_12_count,
        value?.disabled_other_6_12_count,
    ]);

    const disabled_total_13_17_count = sumSafe([
        value?.disabled_male_13_17_count,
        value?.disabled_female_13_17_count,
        value?.disabled_other_13_17_count,
    ]);

    const disabled_total_18_59_count = sumSafe([
        value?.disabled_male_18_59_count,
        value?.disabled_female_18_59_count,
        value?.disabled_other_18_59_count,
    ]);

    const disabled_total_60_plus_count = sumSafe([
        value?.disabled_male_60_plus_count,
        value?.disabled_female_60_plus_count,
        value?.disabled_other_60_plus_count,
    ]);

    const disabled_total_unknown = sumSafe([
        value?.disabled_male_unknown_age_count,
        value?.disabled_female_unknown_age_count,
        value?.disabled_other_unknown_age_count,
    ]);

    const disabled_total_male = sumSafe([
        value?.disabled_male_0_1_count,
        value?.disabled_male_2_5_count,
        value?.disabled_male_6_12_count,
        value?.disabled_male_13_17_count,
        value?.disabled_male_18_59_count,
        value?.disabled_male_60_plus_count,
        value?.disabled_male_unknown_age_count,
    ]);

    const disabled_total_female = sumSafe([
        value?.disabled_female_0_1_count,
        value?.disabled_female_2_5_count,
        value?.disabled_female_6_12_count,
        value?.disabled_female_13_17_count,
        value?.disabled_female_18_59_count,
        value?.disabled_female_60_plus_count,
        value?.disabled_female_unknown_age_count,
    ]);

    const disabled_total_other = sumSafe([
        value?.disabled_other_0_1_count,
        value?.disabled_other_2_5_count,
        value?.disabled_other_6_12_count,
        value?.disabled_other_13_17_count,
        value?.disabled_other_18_59_count,
        value?.disabled_other_60_plus_count,
        value?.disabled_other_unknown_age_count,
    ]);

    const disabled_total = sumSafe([
        disabled_total_male,
        disabled_total_female,
        disabled_total_other,
    ]);

    return (
        <div className={styles.detailedReporting}>
            <div className={styles.tableContainer}>
                <div className={styles.row}>
                    <div className={styles.header}>
                        {strings.genderAgeHeader}
                    </div>
                    <div className={styles.header}>
                        {strings.zeroOneHeader}
                    </div>
                    <div className={styles.header}>
                        {strings.twoFiveHeader}
                    </div>
                    <div className={styles.header}>
                        {strings.sixTwelveHeader}
                    </div>
                    <div className={styles.header}>
                        {strings.thirteenSeventeenHeader}
                    </div>
                    <div className={styles.header}>
                        {strings.eighteenFiftyNineHeader}
                    </div>
                    <div className={styles.header}>
                        {strings.sixtyPlusHeader}
                    </div>
                    <div className={styles.header}>
                        {strings.unknownHeader}
                    </div>
                    <div className={styles.header}>
                        {strings.totalHeader}
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={_cs(styles.cell, styles.header)}>
                        {strings.maleHeader}
                    </div>
                    <NumberInput
                        className={styles.cell}
                        inputSectionClassName={styles.inputSection}
                        name="male_0_1_count"
                        onChange={setFieldValue}
                        value={value?.male_0_1_count}
                        disabled={disabled}
                        error={error?.male_0_1_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="male_2_5_count"
                        value={value?.male_2_5_count}
                        disabled={disabled}
                        error={error?.male_2_5_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="male_6_12_count"
                        value={value?.male_6_12_count}
                        disabled={disabled}
                        error={error?.male_6_12_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="male_13_17_count"
                        value={value?.male_13_17_count}
                        disabled={disabled}
                        error={error?.male_13_17_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="male_18_59_count"
                        value={value?.male_18_59_count}
                        disabled={disabled}
                        error={error?.male_18_59_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="male_60_plus_count"
                        value={value?.male_60_plus_count}
                        disabled={disabled}
                        error={error?.male_60_plus_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="male_unknown_age_count"
                        value={value?.male_unknown_age_count}
                        disabled={disabled}
                        error={error?.male_unknown_age_count}
                    />
                    <NumberOutput
                        className={_cs(styles.cell, styles.output)}
                        value={total_male}
                    />
                </div>
                <div className={styles.row}>
                    <div className={_cs(styles.cell, styles.header)}>
                        {strings.femaleHeader}
                    </div>
                    <NumberInput
                        className={styles.cell}
                        name="female_0_1_count"
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        value={value?.female_0_1_count}
                        disabled={disabled}
                        error={error?.female_0_1_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="female_2_5_count"
                        value={value?.female_2_5_count}
                        disabled={disabled}
                        error={error?.female_2_5_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="female_6_12_count"
                        value={value?.female_6_12_count}
                        disabled={disabled}
                        error={error?.female_6_12_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="female_13_17_count"
                        value={value?.female_13_17_count}
                        disabled={disabled}
                        error={error?.female_13_17_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="female_18_59_count"
                        value={value?.female_18_59_count}
                        disabled={disabled}
                        error={error?.female_18_59_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="female_60_plus_count"
                        value={value?.female_60_plus_count}
                        disabled={disabled}
                        error={error?.female_60_plus_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="female_unknown_age_count"
                        value={value?.female_unknown_age_count}
                        disabled={disabled}
                        error={error?.female_unknown_age_count}
                    />
                    <NumberOutput
                        className={_cs(styles.cell, styles.output)}
                        value={total_female}
                    />
                </div>
                <div className={styles.row}>
                    <div className={_cs(styles.cell, styles.header)}>
                        {strings.otherHeader}
                    </div>
                    <NumberInput
                        className={styles.cell}
                        name="other_0_1_count"
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        value={value?.other_0_1_count}
                        disabled={disabled}
                        error={error?.other_0_1_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="other_2_5_count"
                        value={value?.other_2_5_count}
                        disabled={disabled}
                        error={error?.other_2_5_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="other_6_12_count"
                        value={value?.other_6_12_count}
                        disabled={disabled}
                        error={error?.other_6_12_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="other_13_17_count"
                        value={value?.other_13_17_count}
                        disabled={disabled}
                        error={error?.other_13_17_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="other_18_59_count"
                        value={value?.other_18_59_count}
                        disabled={disabled}
                        error={error?.other_18_59_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="other_60_plus_count"
                        value={value?.other_60_plus_count}
                        disabled={disabled}
                        error={error?.other_60_plus_count}
                    />
                    <NumberInput
                        className={styles.cell}
                        onChange={setFieldValue}
                        inputSectionClassName={styles.inputSection}
                        name="other_unknown_age_count"
                        value={value?.other_unknown_age_count}
                        disabled={disabled}
                        error={error?.other_unknown_age_count}
                    />
                    <NumberOutput
                        className={_cs(styles.cell, styles.output)}
                        value={total_other}
                    />
                </div>
                <div className={styles.row}>
                    <div className={_cs(styles.cell, styles.header)}>
                        {strings.totalHeader}
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
                label={strings.disaggregationSwitchLabel}
                name="is_disaggregated_for_disabled"
                value={value?.is_disaggregated_for_disabled}
                disabled={disabled}
                onChange={setFieldValue}
                error={error?.is_disaggregated_for_disabled}
            />
            {value?.is_disaggregated_for_disabled && (
                <div className={styles.tableContainer}>
                    <div className={styles.row}>
                        <div className={styles.header}>
                            {strings.genderAgeHeader}
                        </div>
                        <div className={styles.header}>
                            {strings.zeroOneHeader}
                        </div>
                        <div className={styles.header}>
                            {strings.twoFiveHeader}
                        </div>
                        <div className={styles.header}>
                            {strings.sixTwelveHeader}
                        </div>
                        <div className={styles.header}>
                            {strings.thirteenSeventeenHeader}
                        </div>
                        <div className={styles.header}>
                            {strings.eighteenFiftyNineHeader}
                        </div>
                        <div className={styles.header}>
                            {strings.sixtyPlusHeader}
                        </div>
                        <div className={styles.header}>
                            {strings.unknownHeader}
                        </div>
                        <div className={styles.header}>
                            {strings.totalHeader}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={_cs(styles.cell, styles.header)}>
                            {strings.maleHeader}
                        </div>
                        <NumberInput
                            className={styles.cell}
                            name="disabled_male_0_1_count"
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            value={value?.disabled_male_0_1_count}
                            disabled={disabled}
                            error={error?.disabled_male_0_1_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_male_2_5_count"
                            value={value?.disabled_male_2_5_count}
                            disabled={disabled}
                            error={error?.disabled_male_2_5_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_male_6_12_count"
                            value={value?.disabled_male_6_12_count}
                            disabled={disabled}
                            error={error?.disabled_male_6_12_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_male_13_17_count"
                            value={value?.disabled_male_13_17_count}
                            disabled={disabled}
                            error={error?.disabled_male_13_17_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_male_18_59_count"
                            value={value?.disabled_male_18_59_count}
                            disabled={disabled}
                            error={error?.disabled_male_18_59_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_male_60_plus_count"
                            value={value?.disabled_male_60_plus_count}
                            disabled={disabled}
                            error={error?.disabled_male_60_plus_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_male_unknown_age_count"
                            value={value?.disabled_male_unknown_age_count}
                            disabled={disabled}
                            error={error?.disabled_male_unknown_age_count}
                        />
                        <NumberOutput
                            className={_cs(styles.cell, styles.output)}
                            value={disabled_total_male}
                        />
                    </div>
                    <div className={styles.row}>
                        <div className={_cs(styles.cell, styles.header)}>
                            {strings.femaleHeader}
                        </div>
                        <NumberInput
                            className={styles.cell}
                            name="disabled_female_0_1_count"
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            value={value?.disabled_female_0_1_count}
                            disabled={disabled}
                            error={error?.disabled_female_0_1_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_female_2_5_count"
                            value={value?.disabled_female_2_5_count}
                            disabled={disabled}
                            error={error?.disabled_female_2_5_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_female_6_12_count"
                            value={value?.disabled_female_6_12_count}
                            disabled={disabled}
                            error={error?.disabled_female_6_12_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_female_13_17_count"
                            value={value?.disabled_female_13_17_count}
                            disabled={disabled}
                            error={error?.disabled_female_13_17_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_female_18_59_count"
                            value={value?.disabled_female_18_59_count}
                            disabled={disabled}
                            error={error?.disabled_female_18_59_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_female_60_plus_count"
                            value={value?.disabled_female_60_plus_count}
                            disabled={disabled}
                            error={error?.disabled_female_60_plus_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_female_unknown_age_count"
                            value={value?.disabled_female_unknown_age_count}
                            disabled={disabled}
                            error={error?.disabled_female_unknown_age_count}
                        />
                        <NumberOutput
                            className={_cs(styles.cell, styles.output)}
                            value={disabled_total_female}
                        />
                    </div>
                    <div className={styles.row}>
                        <div className={_cs(styles.cell, styles.header)}>
                            {strings.otherHeader}
                        </div>
                        <NumberInput
                            className={styles.cell}
                            name="disabled_other_0_1_count"
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            value={value?.disabled_other_0_1_count}
                            disabled={disabled}
                            error={error?.disabled_other_0_1_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_other_2_5_count"
                            value={value?.disabled_other_2_5_count}
                            disabled={disabled}
                            error={error?.disabled_other_2_5_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_other_6_12_count"
                            value={value?.disabled_other_6_12_count}
                            disabled={disabled}
                            error={error?.disabled_other_6_12_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_other_13_17_count"
                            value={value?.disabled_other_13_17_count}
                            disabled={disabled}
                            error={error?.disabled_other_13_17_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_other_18_59_count"
                            value={value?.disabled_other_18_59_count}
                            disabled={disabled}
                            error={error?.disabled_other_18_59_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_other_60_plus_count"
                            value={value?.disabled_other_60_plus_count}
                            disabled={disabled}
                            error={error?.disabled_other_60_plus_count}
                        />
                        <NumberInput
                            className={styles.cell}
                            onChange={setFieldValue}
                            inputSectionClassName={styles.inputSection}
                            name="disabled_other_unknown_age_count"
                            value={value?.disabled_other_unknown_age_count}
                            disabled={disabled}
                            error={error?.disabled_other_unknown_age_count}
                        />
                        <NumberOutput
                            className={_cs(styles.cell, styles.output)}
                            value={disabled_total_other}
                        />
                    </div>
                    <div className={styles.row}>
                        <div className={_cs(styles.cell, styles.header)}>
                            {strings.totalHeader}
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
