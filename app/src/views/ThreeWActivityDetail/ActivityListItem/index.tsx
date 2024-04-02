import {
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';

import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type ProjectItem = NonNullable<GoApiResponse<'/api/v2/emergency-project/'>['results']>[number];
type ActivityItem = NonNullable<ProjectItem['activities']>[number];

export type Props = {
    activityItem: ActivityItem;

    supplyMapping: {
        [key: number]: { id: number, title: string };
    } | undefined;
}

function ActivityListItem(props: Props) {
    const {
        activityItem,
        supplyMapping,
    } = props;

    const strings = useTranslation(i18n);

    const {
        action_details,
        custom_action,
        custom_supplies,
        female_count,
        household_count,
        is_simplified_report,
        male_count,
        people_count,
        people_households,
        sector_details,
        supplies,
    } = activityItem;

    return (
        <Container
            className={styles.activityList}
            heading={action_details?.title ?? custom_action}
            headingLevel={4}
            childrenContainerClassName={styles.actionContent}
            spacing="condensed"
        >
            <div className={styles.activityDetails}>
                <TextOutput
                    label={strings.emergencySector}
                    value={sector_details?.title}
                    strongLabel
                />
                <p>
                    {action_details?.title}
                </p>
                {is_simplified_report && people_households === 'people' && (
                    <>
                        {(isDefined(male_count) || isDefined(female_count)) && (
                            <>
                                <TextOutput
                                    label={strings.emergencyMale}
                                    value={male_count}
                                    strongLabel
                                />
                                <TextOutput
                                    label={strings.emergencyFemale}
                                    value={female_count}
                                    strongLabel
                                />
                            </>
                        )}
                        <TextOutput
                            label={strings.emergencyTotalPeople}
                            value={people_count}
                            strongLabel
                        />
                    </>
                )}
                {people_households === 'households' && (
                    <TextOutput
                        label={strings.emergencyTotalHouseholds}
                        value={household_count}
                        strongLabel
                    />
                )}
            </div>
            {/* TODO: only show if action type and not cash type */}
            {isDefined(supplies) && Object.keys(supplies).length > 0 && (
                <Container
                    childrenContainerClassName={styles.supplyContent}
                    heading={strings.emergencySupplies}
                    headingLevel={5}
                    spacing="none"
                >
                    {Object.entries(supplies).map(([supply, value]) => (
                        <TextOutput
                            key={supply}
                            label={supplyMapping?.[Number(supply)]?.title}
                            value={value}
                        />
                    ))}
                </Container>
            )}
            {/* TODO: only show if custom type or action type and not cash type */}
            {Object.keys(custom_supplies).length > 0 && (
                <Container
                    childrenContainerClassName={styles.supplyContent}
                    heading={strings.emergencyCustomSupplies}
                    headingLevel={5}
                    spacing="none"
                >
                    {Object.entries(custom_supplies).map(([supply, value]) => (
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
