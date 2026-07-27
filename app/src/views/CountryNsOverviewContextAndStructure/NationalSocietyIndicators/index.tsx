import { useOutletContext } from 'react-router-dom';
import { HumanResourcesIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    DataDisplay,
    Dialog,
    Heading,
    ListView,
    Message,
    MoreInfo,
    NumberDisplay,
    ProgressBar,
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
import { type CountryOutletContext } from '#utils/outletContext';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface YearPopupProps {
    year: number | undefined | null;
}

function YearPopup(props: YearPopupProps) {
    const { year } = props;

    if (isNotDefined(year)) {
        return null;
    }

    return (
        <MoreInfo>
            <DataDisplay
                label="Data year"
                value={year}
            />
        </MoreInfo>
    );
}

interface Props {
    databankResponse: GoApiResponse<'/api/v2/country/{id}/databank/'> | undefined;
}

function NationalSocietyIndicators(props: Props) {
    const strings = useTranslation(i18n);
    const { countryResponse } = useOutletContext<CountryOutletContext>();
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

    if (isNotDefined(databankResponse)) {
        return null;
    }

    const {
        fdrs_branches,
        fdrs_branches_data_year,
        fdrs_expenditures,
        fdrs_expenditures_data_year,
        fdrs_female_staff_age_18_29,
        fdrs_female_staff_age_30_39,
        fdrs_female_staff_age_40_49,
        fdrs_female_staff_age_50_59,
        fdrs_female_staff_age_60_69,
        fdrs_female_staff_age_70_79,
        fdrs_female_staff_age_80,
        fdrs_female_volunteer_age_13_17,
        fdrs_female_volunteer_age_18_29,
        fdrs_female_volunteer_age_30_39,
        fdrs_female_volunteer_age_40_49,
        fdrs_female_volunteer_age_50_59,
        fdrs_female_volunteer_age_60_69,
        fdrs_female_volunteer_age_6_12,
        fdrs_female_volunteer_age_70_79,
        fdrs_female_volunteer_age_80,
        fdrs_income,
        fdrs_income_data_year,
        fdrs_male_staff_age_18_29,
        fdrs_male_staff_age_30_39,
        fdrs_male_staff_age_40_49,
        fdrs_male_staff_age_50_59,
        fdrs_male_staff_age_60_69,
        fdrs_male_staff_age_70_79,
        fdrs_male_staff_age_80,
        fdrs_male_volunteer_age_13_17,
        fdrs_male_volunteer_age_18_29,
        fdrs_male_volunteer_age_30_39,
        fdrs_male_volunteer_age_40_49,
        fdrs_male_volunteer_age_50_59,
        fdrs_male_volunteer_age_60_69,
        fdrs_male_volunteer_age_6_12,
        fdrs_male_volunteer_age_70_79,
        fdrs_male_volunteer_age_80,
        fdrs_staff_age_18_29,
        fdrs_staff_data_year,
        fdrs_staff_total,
        fdrs_trained_in_first_aid,
        fdrs_trained_in_first_aid_data_year,
        fdrs_volunteer_age_13_17,
        fdrs_volunteer_age_18_29,
        fdrs_volunteer_age_6_12,
        fdrs_volunteer_data_year,
        fdrs_volunteer_total,
        founded_date,
    } = databankResponse;

    const volunteerDisaggregation = [
        {
            label: '6-12',
            male: fdrs_male_volunteer_age_6_12,
            female: fdrs_female_volunteer_age_6_12,
        },
        {
            label: '13-17',
            male: fdrs_male_volunteer_age_13_17,
            female: fdrs_female_volunteer_age_13_17,
        },
        {
            label: '18-29',
            male: fdrs_male_volunteer_age_18_29,
            female: fdrs_female_volunteer_age_18_29,
        },
        {
            label: '30-39',
            male: fdrs_male_volunteer_age_30_39,
            female: fdrs_female_volunteer_age_30_39,
        },
        {
            label: '40-49',
            male: fdrs_male_volunteer_age_40_49,
            female: fdrs_female_volunteer_age_40_49,
        },
        {
            label: '50-59',
            male: fdrs_male_volunteer_age_50_59,
            female: fdrs_female_volunteer_age_50_59,
        },
        {
            label: '60-69',
            male: fdrs_male_volunteer_age_60_69,
            female: fdrs_female_volunteer_age_60_69,
        },
        {
            label: '70-79',
            male: fdrs_male_volunteer_age_70_79,
            female: fdrs_female_volunteer_age_70_79,
        },
        {
            label: '80+',
            male: fdrs_male_volunteer_age_80,
            female: fdrs_female_volunteer_age_80,
        },
    ];

    const staffDisaggregation = [
        {
            label: '18-29',
            male: fdrs_male_staff_age_18_29,
            female: fdrs_female_staff_age_18_29,
        },
        {
            label: '30-39',
            male: fdrs_male_staff_age_30_39,
            female: fdrs_female_staff_age_30_39,
        },
        {
            label: '40-49',
            male: fdrs_male_staff_age_40_49,
            female: fdrs_female_staff_age_40_49,
        },
        {
            label: '50-59',
            male: fdrs_male_staff_age_50_59,
            female: fdrs_female_staff_age_50_59,
        },
        {
            label: '60-69',
            male: fdrs_male_staff_age_60_69,
            female: fdrs_female_staff_age_60_69,
        },
        {
            label: '70-79',
            male: fdrs_male_staff_age_70_79,
            female: fdrs_female_staff_age_70_79,
        },
        {
            label: '80+',
            male: fdrs_male_staff_age_80,
            female: fdrs_female_staff_age_80,
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

    let youthValue = sumSafe([
        fdrs_volunteer_age_6_12,
        fdrs_volunteer_age_13_17,
        fdrs_volunteer_age_18_29,
        fdrs_staff_age_18_29,
    ]);
    if (isDefined(totalVolunteerDisaggregation) || isDefined(totalStaffDisaggregation)) {
        youthValue = youthValue ?? 0;
    }

    return (
        <Container
            empty={false}
            pending={false}
            filtered={false}
            errored={false}
            heading={strings.nationalSocietyIndicatorsTitle}
            headerActions={isDefined(countryResponse?.fdrs) && (
                <Link
                    href={`https://data.ifrc.org/fdrs/national-society/${countryResponse.fdrs}`}
                    external
                    withLinkIcon
                    colorVariant="primary"
                    styleVariant="filled"
                >
                    {strings.goToFDRS}
                </Link>
            )}
            headingLevel={4}
            withHeaderBorder
            footerActions={isDefined(countryResponse?.fdrs)
                && isDefined(countryResponse.society_name) && (
                <DataDisplay
                    label={strings.indicatorSourceLabel}
                    value={(
                        <Link
                            styleVariant="action"
                            href={`https://data.ifrc.org/fdrs/national-society/${countryResponse.fdrs}`}
                            external
                            withUnderline
                        >
                            {resolveToString(
                                strings.indicatorSourceFDRSLabel,
                                { nationalSociety: countryResponse.society_name },
                            )}
                        </Link>
                    )}
                />
            )}
        >
            <ListView
                layout="grid"
                numPreferredGridColumns={3}
                withSpacingOpticalCorrection
                spacing="sm"
            >
                <DataDisplay
                    label={strings.nationalSocietyFoundedDateLabel}
                    value={founded_date}
                    valueType="date"
                    strongValue
                />
                <DataDisplay
                    label={strings.nationalSocietyTrainedInFirstAidLabel}
                    value={fdrs_trained_in_first_aid}
                    valueType="number"
                    description={(isDefined(fdrs_trained_in_first_aid)
                        && <YearPopup year={fdrs_trained_in_first_aid_data_year} />)}
                    strongValue
                />
                <DataDisplay
                    label={strings.nationalSocietyIncomeLabel}
                    value={fdrs_income}
                    valueType="number"
                    description={isDefined(fdrs_income)
                        && <YearPopup year={fdrs_income_data_year} />}
                    strongValue
                />
                <DataDisplay
                    label={strings.nationalSocietyVolunteersLabel}
                    value={fdrs_volunteer_total}
                    valueType="number"
                    strongValue
                    description={isDefined(fdrs_volunteer_total) && (
                        <ListView spacing="xs">
                            <YearPopup year={fdrs_income_data_year} />
                            {isDefined(totalVolunteerDisaggregation) && (
                                <Button
                                    name={undefined}
                                    onClick={setShowVolunteerDisaggregationTrue}
                                    variant="tertiary"
                                    // FIXME: use strings
                                    title="Show disaggregation"
                                >
                                    <HumanResourcesIcon className={styles.disaggregationIcon} />
                                </Button>
                            )}
                        </ListView>
                    )}
                />
                <DataDisplay
                    label={strings.nationalSocietyYouthLabel}
                    value={youthValue}
                    valueType="number"
                    description={isDefined(youthValue)
                        && <YearPopup year={fdrs_volunteer_data_year} />}
                    strongValue
                />
                <DataDisplay
                    label={strings.nationalSocietyExpendituresLabel}
                    value={fdrs_expenditures}
                    description={(isDefined(fdrs_expenditures)
                        && <YearPopup year={fdrs_expenditures_data_year} />)}
                    valueType="number"
                    strongValue
                />
                <DataDisplay
                    label={strings.nationalSocietyBranchesLabel}
                    value={fdrs_branches}
                    description={(isDefined(fdrs_branches)
                        && <YearPopup year={fdrs_branches_data_year} />)}
                    valueType="number"
                    strongValue
                />
                <DataDisplay
                    label={strings.nationalSocietyStaffLabel}
                    value={fdrs_staff_total}
                    valueType="number"
                    strongValue
                    description={isDefined(fdrs_staff_total) && (
                        <ListView spacing="xs">
                            <YearPopup year={fdrs_staff_data_year} />
                            {isDefined(totalStaffDisaggregation) && (
                                <Button
                                    name={undefined}
                                    onClick={setShowStaffDisaggregationTrue}
                                    variant="tertiary"
                                    // FIXME: use strings
                                    title="Show disaggregation"
                                >
                                    <HumanResourcesIcon className={styles.disaggregationIcon} />
                                </Button>
                            )}
                        </ListView>
                    )}
                />
            </ListView>
            {showVolunteerDisaggregation && (
                <Dialog
                    empty={false}
                    pending={false}
                    filtered={false}
                    errored={false}
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
                        <ListView layout="block">
                            <div className={styles.volunteer}>
                                <div />
                                <DataDisplay
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
                                <DataDisplay
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
                                        <NumberDisplay
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
                                                        <DataDisplay
                                                            label={resolveToString(
                                                                strings.tooltipAgeLabel,
                                                                { ageRange: volunteer.label },
                                                            )}
                                                            value={volunteer.male}
                                                            valueType="number"
                                                            strongValue
                                                        />
                                                        <DataDisplay
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
                                            variant="primary"
                                        >
                                            <Tooltip
                                                title={strings.volunteerTooltipFemaleLabel}
                                                description={(
                                                    <>
                                                        <DataDisplay
                                                            label={resolveToString(
                                                                strings.tooltipAgeLabel,
                                                                { ageRange: volunteer.label },
                                                            )}
                                                            value={volunteer.female}
                                                            valueType="number"
                                                            strongValue
                                                        />
                                                        <DataDisplay
                                                            label={strings.totalLabel}
                                                            value={totalFemaleVolunteer}
                                                            valueType="number"
                                                            strongValue
                                                        />
                                                    </>
                                                )}

                                            />
                                        </ProgressBar>
                                        <NumberDisplay
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
                        </ListView>
                    )}
                </Dialog>
            )}
            {showStaffDisaggregation && (
                <Dialog
                    empty={false}
                    pending={false}
                    filtered={false}
                    errored={false}
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
                        <ListView layout="block">
                            <div className={styles.staff}>
                                <div />
                                <DataDisplay
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
                                <DataDisplay
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
                                        <NumberDisplay
                                            className={styles.malePercentage}
                                            value={getPercentage(
                                                staff.male ?? 0,
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
                                                        <DataDisplay
                                                            label={resolveToString(
                                                                strings.tooltipAgeLabel,
                                                                { ageRange: staff.label },
                                                            )}
                                                            value={staff.male}
                                                            valueType="number"
                                                            strongValue
                                                        />
                                                        <DataDisplay
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
                                                        <DataDisplay
                                                            label={resolveToString(
                                                                strings.tooltipAgeLabel,
                                                                { ageRange: staff.label },
                                                            )}
                                                            value={staff.female}
                                                            valueType="number"
                                                            strongValue
                                                        />
                                                        <DataDisplay
                                                            label={strings.totalLabel}
                                                            value={totalFemaleStaff}
                                                            valueType="number"
                                                            strongValue
                                                        />
                                                    </>
                                                )}

                                            />
                                        </ProgressBar>
                                        <NumberDisplay
                                            className={styles.femalePercentage}
                                            value={getPercentage(
                                                staff.female ?? 0,
                                                totalStaffDisaggregation,
                                            )}
                                            suffix="%"
                                        />
                                    </div>
                                ),
                            )}
                        </ListView>
                    )}
                </Dialog>
            )}
        </Container>
    );
}

export default NationalSocietyIndicators;
