import TextOutput from '#components/TextOutput';
import { paths } from '#generated/types';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Projects = paths['/api/v2/project/']['get'];
type ProjectItem = NonNullable<NonNullable<Projects['responses']['200']['content']['application/json']>['results']>[number];
type AnnualSplitItem = NonNullable<ProjectItem['annual_split_detail']>[number];

interface Props {
    data: AnnualSplitItem;
}
function AnnualSplitList(props: Props) {
    const {
        data,
    } = props;
    const strings = useTranslation(i18n);

    return (
        <>
            <TextOutput
                className={styles.year}
                label={strings.threeWYear}
                value={data?.year}
                strongValue
                withoutLabelColon
            />
            <div className={styles.yearList}>
                <TextOutput
                    className={styles.budget}
                    label={strings.threeWBudgetAmount}
                    value={data.budget_amount}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <div className={styles.budget}>
                    {strings.threeWPeopleTargeted}
                </div>
                <TextOutput
                    className={styles.gender}
                    label={strings.threeWMale}
                    value={data.target_male}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    className={styles.gender}
                    label={strings.threeWFemale}
                    value={data.target_female}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    className={styles.gender}
                    label={strings.threeWOther}
                    value={data.target_other}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    className={styles.gender}
                    label={strings.threeWTotal}
                    value={data.target_total}
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
                    value={data.reached_male}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    className={styles.gender}
                    label={strings.threeWFemale}
                    value={data.reached_female}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    className={styles.gender}
                    label={strings.threeWOther}
                    value={data.reached_other}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    className={styles.gender}
                    label={strings.threeWTotal}
                    value={data.reached_total}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
            </div>
        </>
    );
}

export default AnnualSplitList;
