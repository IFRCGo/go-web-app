import {
    useState,
    useCallback,
    useContext,
    useMemo,
} from 'react';
import { WikiHelpSectionLineIcon } from '@ifrc-go/icons';
import {
    Error,
    getErrorObject,
    getErrorString,
    EntriesAsList,
} from '@togglecorp/toggle-form';
import {
    isNotDefined,
    isDefined,
    isFalsyString,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import Link from '#components/Link';
import Button from '#components/Button';
import TextInput from '#components/TextInput';
import SelectInput from '#components/SelectInput';
import MultiSelectInput from '#components/MultiSelectInput';
import NumberInput from '#components/NumberInput';
import BooleanInput from '#components/BooleanInput';
import UserMultiSelectInput from '#components/UserMultiSelectInput';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import type { GoApiResponse } from '#utils/restRequest';
import { isValidCountry, isValidNationalSociety } from '#utils/common';
import {
    stringNameSelector,
    numericIdSelector,
    stringValueSelector,
} from '#utils/selectors';
import ServerEnumsContext from '#contexts/server-enums';

import {
    DISASTER_FIRE,
    DISASTER_FLOOD,
    DISASTER_FLASH_FLOOD,
    TYPE_IMMINENT,
    TYPE_LOAN,
} from '../common';
import type { PartialDref } from '../schema';
import ImageWithCaptionInput from '../ImageWithCaptionInput';
import CopyFieldReportSection from './CopyFieldReportSection';
import styles from './styles.module.css';
import i18n from './i18n.json';

type UserListItem = NonNullable<GoApiResponse<'/api/v2/user/'>['results']>[number];

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
    value: PartialDref;
    setFieldValue: (...entries: EntriesAsList<PartialDref>) => void;
    error: Error<PartialDref> | undefined;

    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

function Overview(props: Props) {
    const strings = useTranslation(i18n);
    const {
        dref_dref_dref_type: typeOfDrefOptions,
        dref_dref_disaster_category: drefDisasterCategoryOptions,
        dref_dref_onset_type: drefOnsetTypeOptions,
    } = useContext(ServerEnumsContext);

    const {
        value,
        setFieldValue,
        error: formError,
        fileIdToUrlMap,
        setFileIdToUrlMap,
    } = props;

    const [fetchedUsers, setFetechedUsers] = useState<
        UserListItem[] | undefined | null
    >([]);

    const {
        response: countryResponse,
    } = useRequest({
        url: '/api/v2/country/',
    });

    const {
        pending: fetchingDisasterTypes,
        response: disasterTypesResponse,
    } = useRequest({
        url: '/api/v2/disaster_type/',
    });

    const {
        pending: districtsResponsePending,
        response: districtsResponse,
    } = useRequest({
        skip: isNotDefined(value?.country),
        url: '/api/v2/district/',
        query: {
            country: value?.country,
            limit: 100,
        },
    });

    const handleNSChange = useCallback((nationalSociety: number | undefined) => {
        setFieldValue(nationalSociety, 'national_society');
        setFieldValue(nationalSociety, 'country');
    }, [setFieldValue]);

    const handleGenerateTitleButtonClick = useCallback(
        () => {
            const countryName = countryResponse?.results?.find(
                (country) => country.id === value?.country,
            )?.name;
            const disasterName = disasterTypesResponse?.results?.find(
                (disasterType) => disasterType.id === value?.disaster_type,
            )?.name;
            const currentYear = new Date().getFullYear();
            const title = `${countryName} ${disasterName} ${currentYear}`;
            setFieldValue(title, 'title');
        },
        [
            countryResponse,
            disasterTypesResponse,
            value?.disaster_type,
            value?.country,
            setFieldValue,
        ],
    );

    const disasterTypeOptions = useMemo(
        () => (
            disasterTypesResponse?.results?.map(
                (disasterTypeOption) => {
                    if (isFalsyString(disasterTypeOption.name)) {
                        return undefined;
                    }

                    // NOTE: fixing type
                    return {
                        ...disasterTypeOption,
                        name: disasterTypeOption.name,
                    };
                },
            ).filter(isDefined)
        ),
        [disasterTypesResponse],
    );

    const shouldDisableGenerateTitle = isNotDefined(value?.country)
        || isNotDefined(value?.disaster_type)
        || isNotDefined(disasterTypesResponse)
        || isNotDefined(countryResponse);

    const showManMadeEventInput = value?.disaster_type === DISASTER_FIRE
        || value?.disaster_type === DISASTER_FLASH_FLOOD
        || value?.disaster_type === DISASTER_FLOOD;

    const nationalSocietyOptions = useMemo(
        () => (
            countryResponse?.results?.map(
                (country) => {
                    if (isValidNationalSociety(country)) {
                        return country;
                    }

                    return undefined;
                },
            ).filter(isDefined)
        ),
        [countryResponse],
    );

    const countryOptions = useMemo(
        () => (
            countryResponse?.results?.map(
                (country) => {
                    if (isValidCountry(country)) {
                        return country;
                    }

                    return undefined;
                },
            ).filter(isDefined)
        ),
        [countryResponse],
    );

    const error = getErrorObject(formError);

    // TODO: check styling
    return (
        <Container
            heading={strings.drefFormEssentialInformation}
            className={styles.operationOverview}
            childrenContainerClassName={styles.content}
        >
            <InputSection
                title={strings.drefFormSharingTitle}
                description={strings.drefFormSharingDescription}
            >
                <UserMultiSelectInput
                    name="users"
                    value={value?.users}
                    onChange={setFieldValue}
                    className={styles.region}
                    options={fetchedUsers}
                    onOptionsChange={setFetechedUsers}
                    placeholder={strings.drefFormSelectUsersLabel}
                />
            </InputSection>
            <InputSection
                title={strings.drefFormNationalSociety}
                twoColumn
            >
                <SelectInput
                    error={error?.national_society}
                    name="national_society"
                    keySelector={numericIdSelector}
                    labelSelector={stringNameSelector}
                    onChange={handleNSChange}
                    options={nationalSocietyOptions}
                    value={value?.national_society}
                />
            </InputSection>
            { value?.type_of_dref !== TYPE_LOAN && (
                <CopyFieldReportSection
                    value={value}
                    setFieldValue={setFieldValue}
                />
            )}
            <InputSection title={strings.drefFormDrefTypeTitle}>
                <SelectInput
                    name="type_of_dref"
                    label={strings.drefFormTypeOfDref}
                    options={typeOfDrefOptions}
                    keySelector={typeOfDrefKeySelector}
                    labelSelector={stringValueSelector}
                    onChange={setFieldValue}
                    value={value?.type_of_dref}
                    error={error?.type_of_dref}
                />
            </InputSection>
            <InputSection
                title={
                    value?.type_of_dref === TYPE_IMMINENT
                        ? strings.drefFormImminentDisasterDetails
                        : strings.drefFormDisasterDetails
                }
                multiRow
                twoColumn
            >
                <SelectInput
                    label={
                        value?.type_of_dref === TYPE_IMMINENT
                            ? strings.drefFormImminentDisasterTypeLabel
                            : strings.drefFormDisasterTypeLabel
                    }
                    name="disaster_type"
                    options={disasterTypeOptions}
                    optionsPending={fetchingDisasterTypes}
                    keySelector={numericIdSelector}
                    labelSelector={stringNameSelector}
                    value={value?.disaster_type}
                    onChange={setFieldValue}
                    error={error?.disaster_type}
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
                />
                {showManMadeEventInput && (
                    <BooleanInput
                        name="is_man_made_event"
                        label={strings.drefFormManMadeEvent}
                        value={value?.is_man_made_event}
                        onChange={setFieldValue}
                        error={error?.is_man_made_event}
                    />
                )}
                {!showManMadeEventInput && <div />}
                <SelectInput
                    name="disaster_category"
                    label={(
                        <>
                            {value?.type_of_dref === TYPE_IMMINENT

                                ? strings.drefFormImminentDisasterCategoryLabel
                                : strings.drefFormDisasterCategoryLabel}
                            <Link
                                title={strings.drefFormClickEmergencyResponseFramework}
                                to={disasterCategoryLink}
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
                />
            </InputSection>
            <InputSection
                title={
                    value?.type_of_dref !== TYPE_IMMINENT
                        ? strings.drefFormAffectedCountryAndProvinceImminent
                        : strings.drefFormRiskCountryLabel
                }
                twoColumn
            >
                <SelectInput
                    name="country"
                    label={strings.drefFormAddCountry}
                    options={countryOptions}
                    keySelector={numericIdSelector}
                    labelSelector={stringNameSelector}
                    value={value?.country}
                    onChange={setFieldValue}
                    error={error?.country}

                />
                <MultiSelectInput
                    name="district"
                    label={strings.drefFormAddRegion}
                    options={districtsResponse?.results}
                    optionsPending={districtsResponsePending}
                    keySelector={numericIdSelector}
                    labelSelector={stringNameSelector}
                    value={value?.district}
                    onChange={setFieldValue}
                    error={getErrorString(error?.district)}
                />
            </InputSection>
            <InputSection title={strings.drefFormTitle}>
                <TextInput
                    name="title"
                    value={value?.title}
                    onChange={setFieldValue}
                    error={error?.title}
                />
                <Button
                    className={styles.generateTitleButton}
                    name={undefined}
                    variant="secondary"
                    onClick={handleGenerateTitleButtonClick}
                    disabled={shouldDisableGenerateTitle}
                >
                    {strings.drefFormGenerateTitle}
                </Button>
            </InputSection>
            <InputSection
                multiRow
                twoColumn
            >
                <NumberInput
                    name="num_affected"
                    label={value?.type_of_dref === TYPE_IMMINENT ? (
                        <>
                            {strings.drefFormRiskPeopleLabel}
                            <Link
                                title={strings.drefFormClickEmergencyResponseFramework}
                                to={totalPopulationRiskImminentLink}
                            >
                                <WikiHelpSectionLineIcon />
                            </Link>
                        </>
                    ) : (
                        <>
                            {strings.drefFormPeopleAffected}
                            <Link
                                title={strings.drefFormClickEmergencyResponseFramework}
                                to={totalPeopleAffectedSlowSuddenLink}
                            >
                                <WikiHelpSectionLineIcon />
                            </Link>
                        </>
                    )}
                    value={value?.num_affected}
                    onChange={setFieldValue}
                    error={error?.num_affected}
                    hint={(
                        value?.type_of_dref === TYPE_IMMINENT
                            ? strings.drefFormPeopleAffectedDescriptionImminent
                            : strings.drefFormPeopleAffectedDescriptionSlowSudden
                    )}
                />
                {value?.type_of_dref !== TYPE_LOAN && (
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
                                    to={peopleInNeedLink}
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
                    />
                )}
                <NumberInput
                    label={(
                        <>
                            {strings.drefFormPeopleTargeted}
                            <Link
                                title={strings.drefFormClickEmergencyResponseFramework}
                                to={peopleTargetedLink}
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
                />
                {/* NOTE: Empty div to preserve the layout */}
                <div />
            </InputSection>
            {value?.type_of_dref !== TYPE_LOAN && (
                <InputSection
                    title={strings.drefFormRequestAmount}
                    twoColumn
                >
                    <NumberInput
                        name="amount_requested"
                        value={value?.amount_requested}
                        onChange={setFieldValue}
                        error={error?.amount_requested}
                    />
                </InputSection>
            )}
            {value?.type_of_dref !== TYPE_LOAN && (
                <InputSection
                    title={strings.drefFormEmergencyAppealPlanned}
                >
                    <BooleanInput
                        name="emergency_appeal_planned"
                        value={value?.emergency_appeal_planned}
                        onChange={setFieldValue}
                        error={error?.emergency_appeal_planned}
                    />
                </InputSection>
            )}
            {value?.type_of_dref !== TYPE_LOAN && (
                <InputSection
                    title={strings.drefFormUploadMap}
                    description={strings.drefFormUploadMapDescription}
                    contentSectionClassName={styles.imageInputContent}
                    twoColumn
                >
                    <ImageWithCaptionInput
                        name="event_map_file"
                        value={value?.event_map_file}
                        onChange={setFieldValue}
                        error={getErrorObject(error?.event_map_file)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        label={strings.drefFormUploadAnImageLabel}
                    />
                </InputSection>
            )}
            {value?.type_of_dref !== TYPE_LOAN && (
                <InputSection
                    title={strings.drefFormUploadCoverImage}
                    description={strings.drefFormUploadCoverImageDescription}
                    contentSectionClassName={styles.imageInputContent}
                    twoColumn
                >
                    <ImageWithCaptionInput
                        name="cover_image_file"
                        value={value?.cover_image_file}
                        onChange={setFieldValue}
                        error={getErrorObject(error?.cover_image_file)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        label={strings.drefFormUploadAnImageLabel}
                    />
                </InputSection>
            )}
        </Container>
    );
}

export default Overview;
