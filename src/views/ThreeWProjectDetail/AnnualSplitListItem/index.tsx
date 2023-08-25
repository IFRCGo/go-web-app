import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export type Props = {
    targetMale?: number | null | undefined;
    targetFemale?: number | null | undefined;
    targetOther?: number | null | undefined;
    targetTotal?: number | null | undefined;
    reachedMale?: number | null | undefined;
    reachedFemale?: number | null | undefined;
    reachedOther?: number | null | undefined;
    reachedTotal?: number | null | undefined;
} & ({
    isAnnualSplit: true;
    year: number | null | undefined;
    budgetAmount: number | null | undefined;
} | {
    isAnnualSplit?: false;
    year?: number | null | undefined;
    budgetAmount?: number | null | undefined;
});

function AnnualSplitListItem(props: Props) {
    const {
        year,
        budgetAmount,
        targetMale,
        targetFemale,
        targetOther,
        targetTotal,
        reachedMale,
        reachedFemale,
        reachedOther,
        reachedTotal,
        isAnnualSplit = false,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <>
            {isAnnualSplit && (
                <TextOutput
                    className={styles.year}
                    label={strings.threeWYear}
                    value={year}
                    strongValue
                    withoutLabelColon
                />
            )}
            <div className={styles.yearList}>
                {isAnnualSplit && (
                    <TextOutput
                        className={styles.budget}
                        label={strings.threeWBudgetAmount}
                        value={budgetAmount}
                        valueType="number"
                        strongValue
                        withoutLabelColon
                    />
                )}
                <div className={styles.budget}>
                    {strings.threeWPeopleTargeted}
                </div>
                <TextOutput
                    className={styles.gender}
                    label={strings.threeWMale}
                    value={targetMale}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    className={styles.gender}
                    label={strings.threeWFemale}
                    value={targetFemale}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    className={styles.gender}
                    label={strings.threeWOther}
                    value={targetOther}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    className={styles.gender}
                    label={strings.threeWTotal}
                    value={targetTotal}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <div>
                    &nbsp;
                </div>
                <div>
                    <div className={styles.budget}>
                        {strings.threeWPeopleReached1}
                    </div>
                </div>
                <TextOutput
                    className={styles.gender}
                    label={strings.threeWMale}
                    value={reachedMale}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    className={styles.gender}
                    label={strings.threeWFemale}
                    value={reachedFemale}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    className={styles.gender}
                    label={strings.threeWOther}
                    value={reachedOther}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    className={styles.gender}
                    label={strings.threeWTotal}
                    value={reachedTotal}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
            </div>
        </>
    );
}

export default AnnualSplitListItem;
