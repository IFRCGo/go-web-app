import { InfoIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    Heading,
    Message,
    Modal,
    NumberOutput,
    ProgressBar,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    getPercentage,
    maxSafe,
    resolveToString,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    databankResponse: GoApiResponse<'/api/v2/country/{id}/databank/'> | undefined;
}

function NationalSocietyIndicators(props: Props) {
    const strings = useTranslation(i18n);
    const { databankResponse } = props;
    const [
        showStaffDisaggregation,
        {
            setTrue: setShowStaffDisaggregationTrue,
            setFalse: setShowStaffDisaggregationFalse,
        },
    ] = useBooleanState(false);
    const [
        showVolunteerDisaggregation,
        {
            setTrue: setShowVolunteerDisaggregationTrue,
            setFalse: setShowVolunteerDisaggregationFalse,
        },
    ] = useBooleanState(false);

    if (!databankResponse) {
        return null;
    }

    const youthValue = sumSafe([
        databankResponse.volunteer_age_6_12,
        databankResponse.volunteer_age_13_17,
        databankResponse.volunteer_age_18_29,
        databankResponse.staff_age_18_29,
    ]);

    const volunteerDisaggregation = [
        {
            label: '6-12',
            male: databankResponse.male_volunteer_age_6_12,
            female: databankResponse.female_volunteer_age_6_12,
        },
        {
            label: '13-17',
            male: databankResponse.male_volunteer_age_13_17,
            female: databankResponse.female_volunteer_age_13_17,
        },
        {
            label: '18-29',
            male: databankResponse.male_volunteer_age_18_29,
            female: databankResponse.female_volunteer_age_18_29,
        },
        {
            label: '30-39',
            male: databankResponse.male_volunteer_age_30_39,
            female: databankResponse.female_volunteer_age_30_39,
        },
        {
            label: '40-49',
            male: databankResponse.male_volunteer_age_40_49,
            female: databankResponse.female_volunteer_age_40_49,
        },
        {
            label: '50-59',
            male: databankResponse.male_volunteer_age_50_59,
            female: databankResponse.female_volunteer_age_50_59,
        },
        {
            label: '60-69',
            male: databankResponse.male_volunteer_age_60_69,
            female: databankResponse.female_volunteer_age_60_69,
        },
        {
            label: '70-79',
            male: databankResponse.male_volunteer_age_70_79,
            female: databankResponse.female_volunteer_age_70_79,
        },
        {
            label: '80+',
            male: databankResponse.male_volunteer_age_80,
            female: databankResponse.female_volunteer_age_80,
        },
    ];

    const staffDisaggregation = [
        {
            label: '18-29',
            male: databankResponse.male_staff_age_18_29,
            female: databankResponse.female_staff_age_18_29,
        },
        {
            label: '30-39',
            male: databankResponse.male_staff_age_30_39,
            female: databankResponse.female_staff_age_30_39,
        },
        {
            label: '40-49',
            male: databankResponse.male_staff_age_40_49,
            female: databankResponse.female_staff_age_40_49,
        },
        {
            label: '50-59',
            male: databankResponse.male_staff_age_50_59,
            female: databankResponse.female_staff_age_50_59,
        },
        {
            label: '60-69',
            male: databankResponse.male_staff_age_60_69,
            female: databankResponse.female_staff_age_60_69,
        },
        {
            label: '70-79',
            male: databankResponse.male_staff_age_70_79,
            female: databankResponse.female_staff_age_70_79,
        },
        {
            label: '80+',
            male: databankResponse.male_staff_age_80,
            female: databankResponse.female_staff_age_80,
        },
    ];

    const totalMaleVolunteer = sumSafe(volunteerDisaggregation.map(({ male }) => male));
    const maxMaleVolunteer = maxSafe(volunteerDisaggregation.map(({ male }) => male));
    const totalFemaleVolunteer = sumSafe(volunteerDisaggregation.map(({ female }) => female));
    const maxFemaleVolunteer = maxSafe(volunteerDisaggregation.map(({ female }) => female));
    const totalVolunteerDisaggregation = sumSafe([totalMaleVolunteer, totalFemaleVolunteer]);
    const maxVolunteerInDisaggregation = maxSafe([maxMaleVolunteer, maxFemaleVolunteer]);

    const totalMaleStaff = sumSafe(staffDisaggregation.map(({ male }) => male));
    const maxMaleStaff = maxSafe(staffDisaggregation.map(({ male }) => male));
    const totalFemaleStaff = sumSafe(staffDisaggregation.map(({ female }) => female));
    const maxFemaleStaff = maxSafe(staffDisaggregation.map(({ female }) => female));
    const totalStaffDisaggregation = sumSafe([totalMaleStaff, totalFemaleStaff]);
    const maxStaffInDisaggregation = maxSafe([maxMaleStaff, maxFemaleStaff]);

    return (
        <Container
            className={styles.nationalSocietyIndicators}
            heading={strings.nationalSocietyIndicatorsTitle}
            actions={(
                <Link
                    href="https://data.ifrc.org/fdrs/"
                    external
                    withLinkIcon
                    variant="primary"
                >
                    {strings.goToFDRS}
                </Link>
            )}
            headingLevel={4}
            withHeaderBorder
            contentViewType="grid"
            numPreferredGridContentColumns={3}
            footerContentClassName={styles.footerContent}
            footerActions={(
                <TextOutput
                    label={strings.source}
                    value={(
                        <Link
                            variant="tertiary"
                            href="https://data.ifrc.org/fdrs/"
                            external
                            withUnderline
                        >
                            {strings.fdrs}
                        </Link>
                    )}
                />
            )}
        >
            <TextOutput
                label={strings.nationalSocietyFoundedDateLabel}
                value={databankResponse?.founded_date}
                valueType="date"
                strongValue
            />
            <TextOutput
                label={strings.nationalSocietyTrainedInFirstAidLabel}
                value={databankResponse?.trained_in_first_aid}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.nationalSocietyIncomeLabel}
                value={databankResponse?.income}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.nationalSocietyVolunteersLabel}
                value={databankResponse?.volunteer_total}
                valueType="number"
                strongValue
                description={(
                    <Button
                        name={undefined}
                        onClick={setShowVolunteerDisaggregationTrue}
                        variant="tertiary"
                    >
                        <InfoIcon className={styles.infoIcon} />
                    </Button>
                )}
            />
            <TextOutput
                label={strings.nationalSocietyYouthLabel}
                value={youthValue}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.nationalSocietyExpendituresLabel}
                value={databankResponse?.expenditures}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.nationalSocietyBranchesLabel}
                value={databankResponse?.branches}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.nationalSocietyStaffLabel}
                value={databankResponse?.staff_total}
                valueType="number"
                strongValue
                description={(
                    <Button
                        name={undefined}
                        onClick={setShowStaffDisaggregationTrue}
                        variant="tertiary"
                    >
                        <InfoIcon className={styles.infoIcon} />
                    </Button>
                )}
            />
            {showVolunteerDisaggregation && (
                <Modal
                    heading={strings.volunteerModalHeading}
                    onClose={setShowVolunteerDisaggregationFalse}
                    withHeaderBorder
                >
                    {isNotDefined(totalVolunteerDisaggregation) && (
                        <Message
                            description={strings.disaggregationNotAvailableMessage}
                        />
                    )}
                    {isDefined(totalVolunteerDisaggregation) && (
                        <div className={styles.volunteerList}>
                            <div className={styles.volunteer}>
                                <div />
                                <TextOutput
                                    className={styles.maleLabel}
                                    description={strings.maleLabel}
                                    value={getPercentage(
                                        totalMaleVolunteer,
                                        totalVolunteerDisaggregation,
                                    )}
                                    valueType="number"
                                    suffix="%"
                                    strongValue
                                />
                                <Heading
                                    level={4}
                                    className={styles.label}
                                >
                                    {strings.ageLabel}
                                </Heading>
                                <TextOutput
                                    label="Female"
                                    value={getPercentage(
                                        totalFemaleVolunteer,
                                        totalVolunteerDisaggregation,
                                    )}
                                    valueType="number"
                                    withoutLabelColon
                                    suffix="%"
                                    strongValue
                                />
                                <div />
                            </div>
                            {volunteerDisaggregation.reverse().map(
                                (volunteer) => (
                                    <div
                                        key={volunteer.label}
                                        className={styles.volunteer}
                                    >
                                        <NumberOutput
                                            className={styles.malePercentage}
                                            value={getPercentage(
                                                volunteer.male,
                                                totalVolunteerDisaggregation,
                                            )}
                                            suffix="%"
                                        />
                                        <ProgressBar
                                            className={styles.maleDisaggregation}
                                            value={volunteer.male}
                                            totalValue={maxVolunteerInDisaggregation}
                                        >
                                            <Tooltip
                                                title={strings.volunteerTooltipMaleLabel}
                                                description={(
                                                    <>
                                                        <TextOutput
                                                            label={resolveToString(
                                                                strings.tooltipAgeLabel,
                                                                { ageRange: volunteer.label },
                                                            )}
                                                            value={volunteer.male}
                                                            valueType="number"
                                                            strongValue
                                                        />
                                                        <TextOutput
                                                            label={strings.totalLabel}
                                                            value={totalMaleVolunteer}
                                                            valueType="number"
                                                            strongValue
                                                        />
                                                    </>
                                                )}

                                            />
                                        </ProgressBar>
                                        <div className={styles.label}>
                                            {volunteer.label}
                                        </div>
                                        <ProgressBar
                                            className={styles.femaleDisaggregation}
                                            value={volunteer.female}
                                            totalValue={maxVolunteerInDisaggregation}
                                        >
                                            <Tooltip
                                                title={strings.volunteerTooltipFemaleLabel}
                                                description={(
                                                    <>
                                                        <TextOutput
                                                            label={resolveToString(
                                                                strings.tooltipAgeLabel,
                                                                { ageRange: volunteer.label },
                                                            )}
                                                            value={volunteer.female}
                                                            valueType="number"
                                                            strongValue
                                                        />
                                                        <TextOutput
                                                            label={strings.totalLabel}
                                                            value={totalFemaleVolunteer}
                                                            valueType="number"
                                                            strongValue
                                                        />
                                                    </>
                                                )}

                                            />
                                        </ProgressBar>
                                        <NumberOutput
                                            className={styles.femalePercentage}
                                            value={getPercentage(
                                                volunteer.female,
                                                totalVolunteerDisaggregation,
                                            )}
                                            suffix="%"
                                        />
                                    </div>
                                ),
                            )}
                        </div>
                    )}
                </Modal>
            )}
            {showStaffDisaggregation && (
                <Modal
                    heading={strings.staffModalHeading}
                    onClose={setShowStaffDisaggregationFalse}
                    withHeaderBorder
                >
                    {isNotDefined(totalStaffDisaggregation) && (
                        <Message
                            description={strings.disaggregationNotAvailableMessage}
                        />
                    )}
                    {isDefined(totalStaffDisaggregation) && (
                        <div className={styles.staffList}>
                            <div className={styles.staff}>
                                <div />
                                <TextOutput
                                    className={styles.maleLabel}
                                    description={strings.maleLabel}
                                    value={getPercentage(
                                        totalMaleStaff,
                                        totalStaffDisaggregation,
                                    )}
                                    valueType="number"
                                    suffix="%"
                                    strongValue
                                />
                                <Heading
                                    level={4}
                                    className={styles.label}
                                >
                                    {strings.ageLabel}
                                </Heading>
                                <TextOutput
                                    label={strings.femaleLabel}
                                    value={getPercentage(
                                        totalFemaleStaff,
                                        totalStaffDisaggregation,
                                    )}
                                    valueType="number"
                                    withoutLabelColon
                                    suffix="%"
                                    strongValue
                                />
                                <div />
                            </div>
                            {staffDisaggregation.reverse().map(
                                (staff) => (
                                    <div
                                        key={staff.label}
                                        className={styles.staff}
                                    >
                                        <NumberOutput
                                            className={styles.malePercentage}
                                            value={getPercentage(
                                                staff.male,
                                                totalStaffDisaggregation,
                                            )}
                                            suffix="%"
                                        />
                                        <ProgressBar
                                            className={styles.maleDisaggregation}
                                            value={staff.male}
                                            totalValue={maxStaffInDisaggregation}
                                        >
                                            <Tooltip
                                                title={strings.staffTooltipMaleLabel}
                                                description={(
                                                    <>
                                                        <TextOutput
                                                            label={resolveToString(
                                                                strings.tooltipAgeLabel,
                                                                { ageRange: staff.label },
                                                            )}
                                                            value={staff.male}
                                                            valueType="number"
                                                            strongValue
                                                        />
                                                        <TextOutput
                                                            label={strings.totalLabel}
                                                            value={totalMaleStaff}
                                                            valueType="number"
                                                            strongValue
                                                        />
                                                    </>
                                                )}

                                            />
                                        </ProgressBar>
                                        <div className={styles.label}>
                                            {staff.label}
                                        </div>
                                        <ProgressBar
                                            className={styles.femaleDisaggregation}
                                            value={staff.female}
                                            totalValue={maxStaffInDisaggregation}
                                        >
                                            <Tooltip
                                                title={strings.staffTooltipFemaleLabel}
                                                description={(
                                                    <>
                                                        <TextOutput
                                                            label={resolveToString(
                                                                strings.tooltipAgeLabel,
                                                                { ageRange: staff.label },
                                                            )}
                                                            value={staff.female}
                                                            valueType="number"
                                                            strongValue
                                                        />
                                                        <TextOutput
                                                            label={strings.totalLabel}
                                                            value={totalFemaleStaff}
                                                            valueType="number"
                                                            strongValue
                                                        />
                                                    </>
                                                )}

                                            />
                                        </ProgressBar>
                                        <NumberOutput
                                            className={styles.femalePercentage}
                                            value={getPercentage(
                                                staff.female,
                                                totalStaffDisaggregation,
                                            )}
                                            suffix="%"
                                        />
                                    </div>
                                ),
                            )}
                        </div>
                    )}
                </Modal>
            )}
        </Container>
    );
}

export default NationalSocietyIndicators;
