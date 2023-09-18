import {
    useCallback,
    type SetStateAction,
    type Dispatch,
} from 'react';
import { WikiHelpSectionLineIcon } from '@ifrc-go/icons';
import {
    type Error,
    getErrorObject,
    getErrorString,
    type EntriesAsList,
} from '@togglecorp/toggle-form';
import {
    isNotDefined,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import Link from '#components/Link';
import Button from '#components/Button';
import TextInput from '#components/TextInput';
import TextArea from '#components/TextArea';
import SelectInput from '#components/SelectInput';
import NumberInput from '#components/NumberInput';
import useTranslation from '#hooks/useTranslation';
import { type GoApiResponse } from '#utils/restRequest';
import {
    stringValueSelector,
} from '#utils/selectors';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useCountry from '#hooks/domain/useCountry';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import DistrictSearchMultiSelectInput, {
    type DistrictItem,
} from '#components/domain/DistrictSearchMultiSelectInput';
import useDisasterType from '#hooks/domain/useDisasterType';
import ImageWithCaptionInput from '#components/domain/ImageWithCaptionInput';

import {
    TYPE_IMMINENT,
} from '../common';
import { type PartialFinalReport } from '../schema';
import styles from './styles.module.css';
import i18n from './i18n.json';

const disasterCategoryLink = 'https://www.ifrc.org/sites/default/files/2021-07/IFRC%20Emergency%20Response%20Framework%20-%202017.pdf';
const totalPopulationRiskImminentLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';
const totalPeopleAffectedSlowSuddenLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';
const peopleTargetedLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';
const peopleInNeedLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type DrefTypeOption = NonNullable<GlobalEnumsResponse['dref_dref_dref_type']>[number];
type DisasterCategoryOption = NonNullable<GlobalEnumsResponse['dref_dref_disaster_category']>[number];
type OnsetTypeOption = NonNullable<GlobalEnumsResponse['dref_dref_onset_type']>[number];

function typeOfDrefKeySelector(option: DrefTypeOption) {
    return option.key;
}
function disasterCategoryKeySelector(option: DisasterCategoryOption) {
    return option.key;
}
function onsetTypeKeySelector(option: OnsetTypeOption) {
    return option.key;
}

interface Props {
    value: PartialFinalReport;
    setFieldValue: (...entries: EntriesAsList<PartialFinalReport>) => void;
    error: Error<PartialFinalReport> | undefined;
    disabled?: boolean;

    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    districtOptions: DistrictItem[] | null | undefined;
    setDistrictOptions: Dispatch<SetStateAction<DistrictItem[] | null | undefined>>;
}

function Overview(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        disabled,
        districtOptions,
        setDistrictOptions,
    } = props;

    const strings = useTranslation(i18n);
    const {
        dref_dref_dref_type: typeOfDrefOptions,
        dref_dref_disaster_category: drefDisasterCategoryOptions,
        dref_dref_onset_type: drefOnsetTypeOptions,
    } = useGlobalEnums();

    const countryOptions = useCountry();

    const disasterTypes = useDisasterType();

    const handleNSChange = useCallback((nationalSociety: number | undefined) => {
        setFieldValue(nationalSociety, 'national_society');
        setFieldValue(nationalSociety, 'country');
    }, [setFieldValue]);

    const handleGenerateTitleButtonClick = useCallback(
        () => {
            const countryName = countryOptions?.find(
                (country) => country.id === value?.country,
            )?.name || '{Country}';
            const disasterName = disasterTypes?.find(
                (disasterType) => disasterType.id === value?.disaster_type,
            )?.name || '{Disaster}';
            const currentYear = new Date().getFullYear();

            const title = `${countryName} ${disasterName} ${currentYear}`;
            setFieldValue(title, 'title');
        },
        [
            countryOptions,
            disasterTypes,
            value?.disaster_type,
            value?.country,
            setFieldValue,
        ],
    );

    const error = getErrorObject(formError);

    return (
        <Container
            heading={strings.drefFormEssentialInformation}
            className={styles.operationOverview}
            childrenContainerClassName={styles.content}
        >
            <InputSection
                title={strings.drefFormNationalSociety}
                numPreferredColumns={2}
                withAsteriskOnTitle
            >
                <NationalSocietySelectInput
                    error={error?.national_society}
                    name="national_society"
                    onChange={handleNSChange}
                    value={value?.national_society}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.drefFormDrefTypeTitle}
                numPreferredColumns={2}
                withAsteriskOnTitle
            >
                <SelectInput
                    name="type_of_dref"
                    label={strings.drefFormTypeOfDref}
                    options={typeOfDrefOptions}
                    keySelector={typeOfDrefKeySelector}
                    labelSelector={stringValueSelector}
                    onChange={setFieldValue}
                    value={value?.type_of_dref}
                    error={error?.type_of_dref}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={
                    value?.type_of_dref === TYPE_IMMINENT
                        ? strings.drefFormImminentDisasterDetails
                        : strings.drefFormDisasterDetails
                }
                numPreferredColumns={2}
            >
                <DisasterTypeSelectInput
                    label={
                        value?.type_of_dref === TYPE_IMMINENT
                            ? strings.drefFormImminentDisasterTypeLabel
                            : strings.drefFormDisasterTypeLabel
                    }
                    name="disaster_type"
                    value={value?.disaster_type}
                    onChange={setFieldValue}
                    error={error?.disaster_type}
                    disabled={disabled}
                />
                <SelectInput
                    name="type_of_onset"
                    label={strings.drefFormTypeOfOnsetLabel}
                    options={drefOnsetTypeOptions}
                    keySelector={onsetTypeKeySelector}
                    labelSelector={stringValueSelector}
                    value={value?.type_of_onset}
                    onChange={setFieldValue}
                    error={error?.type_of_onset}
                    disabled={disabled}
                    withAsterisk
                />
                {/* (value?.disaster_type === DISASTER_FIRE
                    || value?.disaster_type === DISASTER_FLASH_FLOOD
                    || value?.disaster_type === DISASTER_FLOOD)
                    ? (
                        <BooleanInput
                            name="is_man_made_event"
                            label={strings.drefFormManMadeEvent}
                            value={value?.is_man_made_event}
                            onChange={setFieldValue}
                            error={error?.is_man_made_event}
                            disabled={disabled}
                        />
                    ) : (
                        <div />
                    ) */}
                <SelectInput
                    name="disaster_category"
                    label={(
                        <>
                            {value?.type_of_dref === TYPE_IMMINENT

                                ? strings.drefFormImminentDisasterCategoryLabel
                                : strings.drefFormDisasterCategoryLabel}
                            <Link
                                title={strings.drefFormClickEmergencyResponseFramework}
                                href={disasterCategoryLink}
                                external
                                variant="tertiary"
                            >
                                <WikiHelpSectionLineIcon />
                            </Link>
                        </>
                    )}
                    options={drefDisasterCategoryOptions}
                    keySelector={disasterCategoryKeySelector}
                    labelSelector={stringValueSelector}
                    value={value?.disaster_category}
                    onChange={setFieldValue}
                    error={error?.disaster_category}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={
                    value?.type_of_dref !== TYPE_IMMINENT
                        ? strings.drefFormAffectedCountryAndProvinceImminent
                        : strings.drefFormRiskCountryLabel
                }
                numPreferredColumns={2}
                withAsteriskOnTitle
            >
                <CountrySelectInput
                    name="country"
                    label={strings.drefFormAddCountry}
                    value={value?.country}
                    onChange={setFieldValue}
                    error={error?.country}
                    disabled={disabled}
                    withAsterisk
                />
                <DistrictSearchMultiSelectInput
                    name="district"
                    countryId={value.country}
                    label={strings.drefFormAddRegion}
                    options={districtOptions}
                    onChange={setFieldValue}
                    value={value?.district}
                    disabled={disabled}
                    onOptionsChange={setDistrictOptions}
                    error={getErrorString(error?.district)}
                />
            </InputSection>
            <InputSection title={strings.drefFormTitle}>
                <div className={styles.titleContainer}>
                    <TextInput
                        name="title"
                        className={styles.titleInput}
                        value={value?.title}
                        onChange={setFieldValue}
                        error={error?.title}
                        disabled={disabled}
                    />
                    <Button
                        className={styles.generateTitleButton}
                        name={undefined}
                        variant="secondary"
                        onClick={handleGenerateTitleButtonClick}
                        disabled={(
                            disabled
                            || isNotDefined(value?.country)
                            || isNotDefined(value?.disaster_type)
                            || isNotDefined(disasterTypes)
                        )}
                    >
                        {strings.drefFormGenerateTitle}
                    </Button>
                </div>
            </InputSection>
            <InputSection
                numPreferredColumns={2}
            >
                <NumberInput
                    name="number_of_people_affected"
                    label={value?.type_of_dref === TYPE_IMMINENT ? (
                        <>
                            {strings.drefFormRiskPeopleLabel}
                            <Link
                                title={strings.drefFormClickEmergencyResponseFramework}
                                href={totalPopulationRiskImminentLink}
                                external
                            >
                                <WikiHelpSectionLineIcon />
                            </Link>
                        </>
                    ) : (
                        <>
                            {strings.drefFormPeopleAffected}
                            <Link
                                title={strings.drefFormClickEmergencyResponseFramework}
                                href={totalPeopleAffectedSlowSuddenLink}
                                external
                            >
                                <WikiHelpSectionLineIcon />
                            </Link>
                        </>
                    )}
                    value={value?.number_of_people_affected}
                    onChange={setFieldValue}
                    error={error?.number_of_people_affected}
                    hint={(
                        value?.type_of_dref === TYPE_IMMINENT
                            ? strings.drefFormPeopleAffectedDescriptionImminent
                            : strings.drefFormPeopleAffectedDescriptionSlowSudden
                    )}
                    disabled={disabled}
                />
                <NumberInput
                    label={(
                        <>
                            {
                                value?.type_of_dref === TYPE_IMMINENT
                                    ? strings.drefFormEstimatedPeopleInNeed
                                    : strings.drefFormPeopleInNeed
                            }
                            <Link
                                title={strings.drefFormClickEmergencyResponseFramework}
                                href={peopleInNeedLink}
                                external
                            >
                                <WikiHelpSectionLineIcon />
                            </Link>
                        </>
                    )}
                    name="people_in_need"
                    value={value?.people_in_need}
                    onChange={setFieldValue}
                    error={error?.people_in_need}
                    hint={(
                        value?.type_of_dref === TYPE_IMMINENT
                            ? strings.drefFormPeopleInNeedDescriptionImminent
                            : strings.drefFormPeopleInNeedDescriptionSlowSudden
                    )}
                    disabled={disabled}
                />
                <NumberInput
                    label={(
                        <>
                            {strings.finalReportPeopleTargeted}
                            <Link
                                // FIXME: use translations
                                title="Click to view Emergency Response Framework"
                                href={peopleTargetedLink}
                                external
                            >
                                <WikiHelpSectionLineIcon />
                            </Link>
                        </>
                    )}
                    name="number_of_people_targeted"
                    value={value.number_of_people_targeted}
                    onChange={setFieldValue}
                    error={error?.number_of_people_targeted}
                    hint={strings.drefFormPeopleTargetedDescription}
                    disabled={disabled}
                />
                <NumberInput
                    label={(
                        <>
                            {strings.drefFormPeopleTargeted}
                            <Link
                                title={strings.drefFormClickEmergencyResponseFramework}
                                href={peopleTargetedLink}
                                external
                            >
                                <WikiHelpSectionLineIcon />
                            </Link>
                        </>
                    )}
                    name="num_assisted"
                    value={value?.num_assisted}
                    onChange={setFieldValue}
                    error={error?.num_assisted}
                    hint={strings.drefFormPeopleTargetedDescription}
                    disabled={disabled}
                />
                {/* NOTE: Empty div to preserve the layout */}
                <div />
            </InputSection>
            <InputSection
                title={strings.finalReportTotalAllocation}
            >
                <NumberInput
                    name="total_dref_allocation"
                    value={value.total_dref_allocation}
                    error={error?.total_dref_allocation}
                    onChange={undefined}
                    readOnly
                    disabled={disabled}
                />
            </InputSection>

            <InputSection
                title={strings.drefFormUploadMap}
                description={strings.drefFormUploadMapDescription}
                contentSectionClassName={styles.imageInputContent}
                numPreferredColumns={2}
            >
                <ImageWithCaptionInput
                    name="event_map_file"
                    url="/api/v2/dref-files/"
                    value={value?.event_map_file}
                    onChange={setFieldValue}
                    error={getErrorObject(error?.event_map_file)}
                    fileIdToUrlMap={fileIdToUrlMap}
                    setFileIdToUrlMap={setFileIdToUrlMap}
                    label={strings.drefFormUploadAnImageLabel}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.drefFormUploadCoverImage}
                description={strings.drefFormUploadCoverImageDescription}
                contentSectionClassName={styles.imageInputContent}
                numPreferredColumns={2}
            >
                <ImageWithCaptionInput
                    name="cover_image_file"
                    url="/api/v2/dref-files/"
                    value={value?.cover_image_file}
                    onChange={setFieldValue}
                    error={getErrorObject(error?.cover_image_file)}
                    fileIdToUrlMap={fileIdToUrlMap}
                    setFileIdToUrlMap={setFileIdToUrlMap}
                    label={strings.drefFormUploadAnImageLabel}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.finalReportMainDonor}
            >
                <TextArea
                    name="main_donors"
                    value={value.main_donors}
                    onChange={setFieldValue}
                    error={error?.main_donors}
                    disabled={disabled}
                />
            </InputSection>
        </Container>
    );
}

export default Overview;
