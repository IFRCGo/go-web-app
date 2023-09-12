import { isDefined } from '@togglecorp/fujs';

import TextOutput from '#components/TextOutput';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';

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
    peopleHouseholds: 'people' | 'households' | null | undefined;
    customSupply: {
        [key: string]: number;
    };
    activitySupply: {
        [key: string]: number;
    } | undefined;
    activityDetails: string | null | undefined;
    isSimplifiedReport: boolean | null | undefined;

    supplyMapping: {
        [key: number]: { id: number, title: string };
    } | undefined;
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
        supplyMapping,
    } = props;
    const strings = useTranslation(i18n);

    return (
        <Container
            className={styles.activityList}
            heading={title ?? customAction}
            headingLevel={4}
            childrenContainerClassName={styles.actionContent}
            spacing="condensed"
        >
            <div className={styles.activityDetails}>
                <TextOutput
                    label={strings.emergencySector}
                    value={sectorDetails}
                    strongLabel
                />
                <p>
                    {activityDetails}
                </p>
                {isSimplifiedReport && peopleHouseholds === 'people' && (
                    <>
                        {(isDefined(maleCount) || isDefined(femaleCount)) && (
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
            </div>
            {/* TODO: only show if action type and not cash type */}
            {isDefined(activitySupply) && Object.keys(activitySupply).length > 0 && (
                <Container
                    childrenContainerClassName={styles.supplyContent}
                    heading={strings.emergencySupplies}
                    headingLevel={5}
                    spacing="none"
                >
                    {Object.entries(activitySupply).map(([supply, value]) => (
                        <TextOutput
                            key={supply}
                            label={supplyMapping?.[Number(supply)]?.title}
                            value={value}
                        />
                    ))}
                </Container>
            )}
            {/* TODO: only show if custom type or action type and not cash type */}
            {Object.keys(customSupply).length > 0 && (
                <Container
                    childrenContainerClassName={styles.supplyContent}
                    heading={strings.emergencyCustomSupplies}
                    headingLevel={5}
                    spacing="none"
                >
                    {Object.entries(customSupply).map(([supply, value]) => (
                        <TextOutput
                            key={supply}
                            label={supply}
                            value={value}
                        />
                    ))}
                </Container>
            )}
        </Container>
    );
}

export default ActivityListItem;
