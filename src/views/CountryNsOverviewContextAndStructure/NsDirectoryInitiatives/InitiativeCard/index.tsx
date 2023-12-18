import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';

import styles from './styles.module.css';
import i18n from './i18n.json';

interface Props {
    className?: string;
    id: number;
    allocation: number | null | undefined;
    categories: string[] | null | undefined;
    fund_type: string | null | undefined;
    funding_period: number | null | undefined;
    title: string | null | undefined;
    year: string | null | undefined;
}

function InitiativeListItem(props: Props) {
    const {
        className,
        id,
        allocation,
        categories,
        fund_type,
        funding_period,
        title,
        year,
    } = props;

    const strings = useTranslation(i18n);
    const categoriesItem = categories?.join(', ');

    return (
        <Container
            className={_cs(styles.initiativeCard, className)}
            childrenContainerClassName={styles.figures}
            headingLevel={4}
            withInternalPadding
            withHeaderBorder
            withoutWrapInHeading
            // TODO: Verify Fund Name and and Fund Type
            headerDescription={(
                <TextOutput
                    label={strings.initiativeFundNameTitle}
                    value={fund_type}
                    valueType="text"
                    strongLabel
                />
            )}
        >
            <div
                className={styles.figure}
                key={id}
            >
                <TextOutput
                    label={strings.initiativeYearApprovedTitle}
                    value={year}
                    valueType="text"
                    strongValue
                />
                <TextOutput
                    label={strings.initiativeTitle}
                    value={title}
                    valueType="text"
                    strongValue
                />
                <TextOutput
                    label={strings.initiativeFundingTypeTitle}
                    value={fund_type}
                    valueType="text"
                    strongValue
                />
                <TextOutput
                    label={strings.initiativeCategoriesTitle}
                    value={categoriesItem}
                    strongValue
                />
                <div className={styles.separator} />
                <TextOutput
                    label={strings.initiativeAllocationTitle}
                    value={allocation}
                    valueType="number"
                    strongValue
                />
                <TextOutput
                    label={strings.initiativeFundingPeriodTitle}
                    value={`${funding_period} ${strings.initiativeMonthsSuffix}`}
                    valueType="text"
                    strongValue
                />
            </div>
        </Container>
    );
}

export default InitiativeListItem;
