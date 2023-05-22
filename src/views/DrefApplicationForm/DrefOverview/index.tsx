import React, { useCallback } from 'react';
import {
    PartialForm,
    Error,
    EntriesAsList,
    getErrorObject,
    getErrorString,
    SetBaseValueArg,
} from '@togglecorp/toggle-form';
import {
    listToMap,
    isNotDefined,
} from '@togglecorp/fujs';
import { IoHelpCircle } from 'react-icons/io5';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import Button from '#components/Button';
import TextInput from '#components/TextInput';
import SelectInput from '#components/SelectInput';
import MultiSelectInput from '#components/MultiSelectInput';
import SearchMultiSelectInput from '#components/SearchMultiSelectInput';
import useTranslation from '#hooks/useTranslation';
import drefPageStrings from '#strings/dref';
import RadioInput from '#components/RadioInput';
import NumberInput from '#components/NumberInput';
import { rankedSearchOnList, compareLabel } from '#utils/common';
import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';
import { DistrictMini } from '#types/country';
import {
    BooleanValueOption,
    NumericValueOption,
} from '#types/common';

import CopyFieldReportSection from './CopyFieldReportSection';
import ImageWithCaptionInput from './ImageWithCaptionInput';
import {
    optionLabelSelector,
    DrefFields,
    booleanOptionKeySelector,
    DISASTER_FIRE,
    DISASTER_FLOOD,
    DISASTER_FLASH_FLOOD,
    emptyNumericOptionList,
    TYPE_IMMINENT,
    TYPE_LOAN,
    ONSET_SUDDEN,
} from '../common';

import styles from './styles.module.css';

type Value = PartialForm<DrefFields>;

interface Props {
    disasterTypeOptions: NumericValueOption[];
    error: Error<Value> | undefined;
    onValueChange: (...entries: EntriesAsList<Value>) => void;
    value: Value;
    yesNoOptions: BooleanValueOption[];
    countryOptions: NumericValueOption[];
    nationalSocietyOptions: NumericValueOption[];
    disasterCategoryOptions: NumericValueOption[];
    onsetOptions: NumericValueOption[];
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    onValueSet: (value: SetBaseValueArg<Value>) => void;
    userOptions: NumericValueOption[];
    onCreateAndShareButtonClick: () => void;
    drefTypeOptions: NumericValueOption[];
    onsetType?: number;
    drefType?: number;
}

const disasterCategoryLink = 'https://www.ifrc.org/sites/default/files/2021-07/IFRC%20Emergency%20Response%20Framework%20-%202017.pdf';
const totalPopulationRiskImminentLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';
const totalPeopleAffectedSlowSuddenLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';
const peopleTargetedLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';
const peopleInNeedLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';

function DrefOverview(props: Props) {
    const strings = useTranslation('dref', drefPageStrings);

    const {
        countryOptions,
        disasterTypeOptions,
        nationalSocietyOptions,
        error: formError,
        onValueChange,
        value,
        yesNoOptions,
        disasterCategoryOptions,
        onsetOptions,
        setFileIdToUrlMap,
        fileIdToUrlMap,
        onValueSet,
        userOptions,
        onCreateAndShareButtonClick,
        drefTypeOptions,
        onsetType,
        drefType,
    } = props;

    const error = React.useMemo(
        () => getErrorObject(formError),
        [formError],
    );

    React.useMemo(() => {
        const suddenDependentValue = (onsetType === ONSET_SUDDEN)
            ? false : value.emergency_appeal_planned;
        onValueChange(suddenDependentValue, 'emergency_appeal_planned');
    }, [
        onsetType,
        value.emergency_appeal_planned,
        onValueChange,
    ]);

    const handleUserSearch = React.useCallback((
        input: string | undefined,
        callback: (list: NumericValueOption[]) => void,
    ) => {
        if (!input) {
            callback(emptyNumericOptionList);
        }

        callback(rankedSearchOnList(
            userOptions,
            input,
            (d) => d.label,
        ));
    }, [userOptions]);

    const userMap = React.useMemo(() => listToMap(
        userOptions,
        (u) => u.value,
        (u) => u.label,
    ), [userOptions]);

    const initialOptions = React.useMemo(() => (
        value.users?.map((u) => ({
            label: userMap[u],
            value: u,
        }))
    ), [userMap, value.users]);

    const handleNSChange = useCallback((ns: number | undefined) => {
        onValueSet({
            ...value,
            national_society: ns,
            country: ns,
        });
    }, [value, onValueSet]);

    const handleTitleChange = useCallback(() => {
        const getCurrentCountryValue = value?.country;
        const countryName = countryOptions.filter(
            (cd) => cd.value === getCurrentCountryValue,
        ).map((c) => c.label);
        const filteredDisasterTypeName = disasterTypeOptions.filter(
            (dt) => dt.value === value.disaster_type,
        ).map((dt) => dt.label).toString();

        const currentYear = new Date().getFullYear();
        const title = `${countryName} ${filteredDisasterTypeName} ${currentYear}`;
        onValueChange(title, 'title');
    }, [
        countryOptions,
        disasterTypeOptions,
        value.disaster_type,
        value.country,
        onValueChange,
    ]);

    const countryQuery = React.useMemo(() => ({
        country: value.country,
        limit: 500,
    }), [value.country]);

    const {
        response: districtsResponse,
    } = useRequest<ListResponse<DistrictMini>>({
        skip: !value.country,
        url: 'api/v2/district/',
        query: countryQuery,
    });

    const districtOptions = React.useMemo(() => (
        districtsResponse?.results?.map((d) => ({
            value: d.id,
            label: d.name,
        })).sort(compareLabel) ?? emptyNumericOptionList
    ), [districtsResponse]);

    const showManMadeEventInput = value?.disaster_type === DISASTER_FIRE
        || value?.disaster_type === DISASTER_FLASH_FLOOD
        || value?.disaster_category === DISASTER_FLOOD;

    return (
        <>
            <Container
                className={styles.sharing}
                heading={strings.drefFormSharingHeading}
            >
                <InputSection
                    title={strings.drefFormSharingTitle}
                    description={strings.drefFormSharingDescription}
                >
                    <SearchMultiSelectInput
                        name="users"
                        initialOptions={initialOptions}
                        value={value.users}
                        onChange={onValueChange}
                        loadOptions={handleUserSearch}
                        keySelector={(d) => d.value}
                    />
                    {isNotDefined(value.id) && (
                        <div className={styles.actions}>
                            <Button
                                name={undefined}
                                variant="secondary"
                                disabled={isNotDefined(value.users) || value.users.length === 0}
                                onClick={onCreateAndShareButtonClick}
                            >
                                {strings.drefFormInstantShareLabel}
                            </Button>
                        </div>
                    )}
                </InputSection>
            </Container>
            <Container
                heading={strings.drefFormEssentialInformation}
                className={styles.essentialInformation}
            >
                <InputSection
                    title={strings.drefFormNationalSociety}
                    multiRow
                    oneColumn
                >
                    <SelectInput
                        error={error?.national_society}
                        name={'national_society' as const}
                        keySelector={(d) => d.value}
                        onChange={handleNSChange}
                        options={nationalSocietyOptions}
                        value={value.national_society}
                    />
                </InputSection>
                {drefType !== TYPE_LOAN && (
                    <CopyFieldReportSection
                        value={value}
                        onValueSet={onValueSet}
                    />
                )}
                <InputSection title="DREF Type">
                    <SelectInput
                        error={error?.type_of_dref}
                        label={strings.drefFormTypeOfDref}
                        name={'type_of_dref' as const}
                        keySelector={(d) => d.value}
                        onChange={onValueChange}
                        options={drefTypeOptions}
                        value={value.type_of_dref}
                    />
                </InputSection>
                <InputSection
                    title={
                        drefType === TYPE_IMMINENT
                            ? strings.drefFormImminentDisasterDetails
                            : strings.drefFormDisasterDetails
                    }
                    multiRow
                    twoColumn
                >
                    <SelectInput
                        error={error?.disaster_type}
                        label={
                            drefType === TYPE_IMMINENT
                                ? strings.drefFormImminentDisasterTypeLabel
                                : strings.drefFormDisasterTypeLabel
                        }
                        name={'disaster_type' as const}
                        keySelector={(d) => d.value}
                        onChange={onValueChange}
                        options={disasterTypeOptions}
                        value={value.disaster_type}
                    />
                    <SelectInput
                        error={error?.type_of_onset}
                        label={strings.drefFormTypeOfOnsetLabel}
                        name={'type_of_onset' as const}
                        onChange={onValueChange}
                        keySelector={(d) => d.value}
                        options={onsetOptions}
                        value={value.type_of_onset}
                    />
                    {showManMadeEventInput && (
                        <RadioInput
                            label={strings.drefFormManMadeEvent}
                            name={'is_man_made_event' as const}
                            options={yesNoOptions}
                            keySelector={booleanOptionKeySelector}
                            labelSelector={optionLabelSelector}
                            value={value.is_man_made_event}
                            onChange={onValueChange}
                            error={error?.is_man_made_event}
                        />
                    )}
                    {!showManMadeEventInput && <div />}
                    <SelectInput
                        error={error?.disaster_category}
                        label={(
                            <>
                                {drefType === TYPE_IMMINENT

                                    ? strings.drefFormImminentDisasterCategoryLabel
                                    : strings.drefFormDisasterCategoryLabel}
                                <a
                                    className={styles.disasterCategoryHelpLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Click to view Emergency Response Framework"
                                    href={disasterCategoryLink}
                                >
                                    <IoHelpCircle />
                                </a>
                            </>
                        )}
                        name={'disaster_category' as const}
                        keySelector={(d) => d.value}
                        onChange={onValueChange}
                        options={disasterCategoryOptions}
                        value={value.disaster_category}
                    />
                </InputSection>
                <InputSection
                    title={
                        drefType !== TYPE_IMMINENT
                            ? strings.drefFormAffectedCountryAndProvinceImminent
                            : strings.drefFormRiskCountryLabel
                    }
                    twoColumn
                >
                    <SelectInput
                        label={strings.drefFormAddCountry}
                        error={error?.country}
                        name={'country' as const}
                        keySelector={(d) => d.value}
                        onChange={onValueChange}
                        options={countryOptions}
                        value={value.country}

                    />
                    <MultiSelectInput
                        label={strings.drefFormAddRegion}
                        error={getErrorString(error?.district)}
                        name="district"
                        onChange={onValueChange}
                        keySelector={(d) => d.value}
                        options={districtOptions}
                        value={value.district}
                    />
                </InputSection>
                <InputSection title={strings.drefFormTitle}>
                    <TextInput
                        name="title"
                        value={value.title}
                        onChange={onValueChange}
                        error={error?.title}
                    />

                    <Button
                        className={styles.generateTitleButton}
                        name={undefined}
                        variant="secondary"
                        onClick={handleTitleChange}
                    >
                        {strings.drefFormGenerateTitle}
                    </Button>
                </InputSection>
                <InputSection
                    multiRow
                    twoColumn
                >
                    <NumberInput
                        label={drefType === TYPE_IMMINENT ? (
                            <>
                                {strings.drefFormRiskPeopleLabel}
                                <a
                                    className={styles.peopleTargetedHelpLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Click to view Emergency Response Framework"
                                    href={totalPopulationRiskImminentLink}
                                >
                                    <IoHelpCircle />
                                </a>
                            </>
                        ) : (
                            <>
                                {strings.drefFormPeopleAffected}
                                <a
                                    className={styles.peopleTargetedHelpLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Click to view Emergency Response Framework"
                                    href={totalPeopleAffectedSlowSuddenLink}
                                >
                                    <IoHelpCircle />
                                </a>
                            </>
                        )}
                        name="num_affected"
                        value={value.num_affected}
                        onChange={onValueChange}
                        error={error?.num_affected}
                        hint={(
                            drefType === TYPE_IMMINENT
                                ? strings.drefFormPeopleAffectedDescriptionImminent
                                : strings.drefFormPeopleAffectedDescriptionSlowSudden
                        )}
                    />
                    {drefType !== TYPE_LOAN && (
                        <NumberInput
                            label={(
                                <>
                                    {
                                        drefType === TYPE_IMMINENT
                                            ? strings.drefFormEstimatedPeopleInNeed
                                            : strings.drefFormPeopleInNeed
                                    }
                                    <a
                                        className={styles.peopleTargetedHelpLink}
                                        rel="noreferrer"
                                        target="_blank"
                                        title="Click to view Emergency Response Framework"
                                        href={peopleInNeedLink}
                                    >
                                        <IoHelpCircle />
                                    </a>
                                </>
                            )}
                            name="people_in_need"
                            value={value.people_in_need}
                            onChange={onValueChange}
                            error={error?.people_in_need}
                            hint={(
                                drefType === TYPE_IMMINENT
                                    ? strings.drefFormPeopleInNeedDescriptionImminent
                                    : strings.drefFormPeopleInNeedDescriptionSlowSudden
                            )}
                        />
                    )}
                    <NumberInput
                        label={(
                            <>
                                {strings.drefFormPeopleTargeted}
                                <a
                                    className={styles.peopleTargetedHelpLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Click to view Emergency Response Framework"
                                    href={peopleTargetedLink}
                                >
                                    <IoHelpCircle />
                                </a>
                            </>
                        )}
                        name="num_assisted"
                        value={value.num_assisted}
                        onChange={onValueChange}
                        error={error?.num_assisted}
                        hint={strings.drefFormPeopleTargetedDescription}
                    />
                    <div />
                </InputSection>
                {drefType !== TYPE_LOAN && (
                    <InputSection
                        title={strings.drefFormRequestAmount}
                    >
                        <NumberInput
                            name="amount_requested"
                            value={value.amount_requested}
                            onChange={onValueChange}
                            error={error?.amount_requested}
                        />
                    </InputSection>
                )}
                {drefType !== TYPE_LOAN && (
                    <InputSection
                        title={strings.drefFormEmergencyAppealPlanned}
                    >
                        <RadioInput
                            name={'emergency_appeal_planned' as const}
                            options={yesNoOptions}
                            keySelector={booleanOptionKeySelector}
                            labelSelector={optionLabelSelector}
                            value={value.emergency_appeal_planned}
                            onChange={onValueChange}
                            error={error?.emergency_appeal_planned}
                        />
                    </InputSection>
                )}
                {drefType !== TYPE_LOAN && (
                    <InputSection
                        title={strings.drefFormUploadMap}
                        description={strings.drefFormUploadMapDescription}
                        contentSectionClassName={styles.imageInputContent}
                    >
                        <ImageWithCaptionInput
                            name={'event_map_file' as const}
                            value={value?.event_map_file}
                            onChange={onValueChange}
                            error={error?.event_map_file}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            label={strings.drefFormUploadAnImageLabel}
                        />
                    </InputSection>
                )}
                {drefType !== TYPE_LOAN && (
                    <InputSection
                        title={strings.drefFormUploadCoverImage}
                        description={strings.drefFormUploadCoverImageDescription}
                        contentSectionClassName={styles.imageInputContent}
                    >
                        <ImageWithCaptionInput
                            name={'cover_image_file' as const}
                            value={value?.cover_image_file}
                            onChange={onValueChange}
                            error={error?.cover_image_file}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            label={strings.drefFormUploadAnImageLabel}
                        />
                    </InputSection>
                )}
            </Container>
        </>
    );
}

export default DrefOverview;
