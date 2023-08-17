import { useMemo } from 'react';
import { isDefined, listToMap } from '@togglecorp/fujs';

import TextOutput from '#components/TextOutput';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

export type Props = {
    maleCount: number | null | undefined;
    femaleCount: number | null | undefined;
    peopleCount: number | null | undefined;
    householdCount: number | null | undefined;
    title: string | null | undefined;
    customAction: string | null | undefined;
    sectorDetails: string | null | undefined;
    peopleHouseholds: 'people' | 'households' | '' | null | undefined;
    customSupply: {
        [key: string]: number;
    };
    activitySupply: {
        [key: string]: number;
    } | undefined;
    activityDetails: string | null | undefined;
    isSimplifiedReport: boolean | null | undefined;
}

function ActivityListItem(props: Props) {
    const {
        maleCount,
        femaleCount,
        peopleCount,
        householdCount,
        peopleHouseholds,
        title,
        sectorDetails,
        customAction,
        customSupply,
        activitySupply,
        activityDetails,
        isSimplifiedReport,
    } = props;
    const strings = useTranslation(i18n);

    const {
        response: optionsResponse,
    } = useRequest({
        url: '/api/v2/emergency-project/options/',
    });

    const supplyIdToTitleMap = useMemo(() => (
        listToMap(
            optionsResponse?.actions?.flatMap(
                (detail) => detail.supplies_details,
            ).filter(isDefined),
            ((detail) => detail.id),
            ((detail) => detail.title),
        )
    ), [optionsResponse?.actions]);

    return (
        <Container
            className={styles.activityList}
            heading={title ?? customAction}
            headingLevel={3}
            childrenContainerClassName={styles.actionContent}
        >
            <TextOutput
                label={strings.emergencySector}
                value={sectorDetails}
                strongLabel
            />
            <div>
                {activityDetails}
            </div>
            {isSimplifiedReport && peopleHouseholds === 'people' && (
                <>
                    {(isDefined(maleCount)
                        || isDefined(femaleCount))
                        && (
                            <>
                                <TextOutput
                                    label={strings.emergencyMale}
                                    value={maleCount}
                                    strongLabel
                                />
                                <TextOutput
                                    label={strings.emergencyFemale}
                                    value={femaleCount}
                                    strongLabel
                                />
                            </>
                        )}
                    <TextOutput
                        label={strings.emergencyTotalPeople}
                        value={peopleCount}
                        strongLabel
                    />
                </>
            )}
            {peopleHouseholds === 'households' && (
                <TextOutput
                    label={strings.emergencyTotalHouseholds}
                    value={householdCount}
                    strongLabel
                />
            )}
            {isDefined(activitySupply) && Object.keys(activitySupply).length > 0 && (
                <Container childrenContainerClassName={styles.supplyContent}>
                    <div className={styles.supplyHeader}>
                        {strings.emergencySupplies}
                    </div>
                    {(Object.keys(
                        activitySupply,
                    ) as unknown as number[]).map((supply) => (
                        <TextOutput
                            key={supply}
                            label={supplyIdToTitleMap?.[supply]}
                            value={activitySupply?.[supply]}
                            strongLabel
                        />
                    ))}
                </Container>
            )}
            {Object.keys(customSupply).length > 0 && (
                <Container
                    childrenContainerClassName={styles.supplyContent}
                >
                    <div className={styles.supplyHeader}>
                        {strings.emergencyCustomSupplies}
                    </div>
                    {customSupply
                        && Object.entries(customSupply).map(
                            ([supply, value]) => (
                                <TextOutput
                                    key={supply}
                                    label={supply}
                                    value={value}
                                    strongLabel
                                />
                            ),
                        )}
                </Container>
            )}
        </Container>
    );
}

export default ActivityListItem;
