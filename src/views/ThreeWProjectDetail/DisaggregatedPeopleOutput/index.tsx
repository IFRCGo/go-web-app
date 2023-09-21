import { isDefined } from '@togglecorp/fujs';

import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export type Props = {
    year?: number | null | undefined;
    budgetAmount: number | null | undefined;
    targetMale: number | null | undefined;
    targetFemale: number | null | undefined;
    targetOther: number | null | undefined;
    targetTotal: number | null | undefined;
    reachedMale: number | null | undefined;
    reachedFemale: number | null | undefined;
    reachedOther: number | null | undefined;
    reachedTotal: number | null | undefined;
}

function DisaggregatedPeopleOutput(props: Props) {
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
    } = props;

    const strings = useTranslation(i18n);

    return (
        <Container
            className={styles.disaggregatedPeopleOutput}
            heading={isDefined(year) ? (
                <TextOutput
                    label={strings.threeWYear}
                    value={year}
                    strongValue
                    withoutLabelColon
                />
            ) : undefined}
            headingLevel={4}
            headerDescription={(
                <TextOutput
                    label={strings.threeWBudgetAmount}
                    value={budgetAmount}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
            )}
            contentViewType="vertical"
            spacing="comfortable"
        >
            <Container
                childrenContainerClassName={styles.peopleTargetedContent}
                heading={strings.threeWPeopleTargeted}
                headingLevel={5}
                spacing="compact"
            >
                <TextOutput
                    label={strings.threeWMale}
                    value={targetMale}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    label={strings.threeWFemale}
                    value={targetFemale}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    label={strings.threeWOther}
                    value={targetOther}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    label={strings.threeWTotal}
                    value={targetTotal}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
            </Container>
            <Container
                childrenContainerClassName={styles.peopleTargetedContent}
                heading={strings.threeWPeopleReached1}
                headingLevel={5}
                spacing="condensed"
            >
                <TextOutput
                    label={strings.threeWMale}
                    value={reachedMale}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    label={strings.threeWFemale}
                    value={reachedFemale}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    label={strings.threeWOther}
                    value={reachedOther}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    label={strings.threeWTotal}
                    value={reachedTotal}
                    valueType="number"
                    strongValue
                    withoutLabelColon
                />
            </Container>
        </Container>
    );
}

export default DisaggregatedPeopleOutput;
