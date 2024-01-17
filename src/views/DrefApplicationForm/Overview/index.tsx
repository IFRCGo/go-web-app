import {
    useCallback,
    type SetStateAction,
    type Dispatch,
} from 'react';
import {
    type Error,
    getErrorObject,
    getErrorString,
    type EntriesAsList,
} from '@togglecorp/toggle-form';
import { WikiHelpSectionLineIcon } from '@ifrc-go/icons';
import {
    isNotDefined,
} from '@togglecorp/fujs';

import { type FieldReportItem as FieldReportSearchItem } from '#components/domain/FieldReportSearchSelectInput';
import Container from '#components/Container';
import InputSection from '#components/InputSection';
import Button from '#components/Button';
import TextInput from '#components/TextInput';
import SelectInput from '#components/SelectInput';
import Link from '#components/Link';
import BooleanInput from '#components/BooleanInput';
import useTranslation from '#hooks/useTranslation';
import { type GoApiResponse } from '#utils/restRequest';
import {
    stringValueSelector,
} from '#utils/selectors';
import List from '#components/List';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useCountry from '#hooks/domain/useCountry';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import { type User } from '#components/domain/UserSearchMultiSelectInput';
import ImageWithCaptionInput from '#components/domain/ImageWithCaptionInput';
import DistrictSearchMultiSelectInput, {
    type DistrictItem,
} from '#components/domain/DistrictSearchMultiSelectInput';
import UserItem from '#components/domain/DrefShareModal/UserItem';
import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import useDisasterType from '#hooks/domain/useDisasterType';
import {
    DISASTER_CATEGORY_ORANGE,
    DISASTER_CATEGORY_RED,
} from '#utils/constants';

import {
    DISASTER_FIRE,
    DISASTER_FLOOD,
    DISASTER_FLASH_FLOOD,
    TYPE_IMMINENT,
    TYPE_LOAN,
} from '../common';
import { type PartialDref } from '../schema';
import CopyFieldReportSection from './CopyFieldReportSection';
import styles from './styles.module.css';
import i18n from './i18n.json';

const disasterCategoryLink = 'https://www.ifrc.org/sites/default/files/2021-07/IFRC%20Emergency%20Response%20Framework%20-%202017.pdf';

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
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    districtOptions: DistrictItem[] | null | undefined;
    setDistrictOptions: Dispatch<SetStateAction<DistrictItem[] | null | undefined>>;

    fieldReportOptions: FieldReportSearchItem[] | null | undefined;
    setFieldReportOptions: Dispatch<SetStateAction<FieldReportSearchItem[] | null | undefined>>;
    drefUsers?: User[] | null;
}

const userKeySelector = (item: User) => item.id;

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
        fieldReportOptions,
        setFieldReportOptions,
        drefUsers,
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
        if (nationalSociety) {
            setFieldValue(nationalSociety, 'country');
            setFieldValue(undefined, 'district');
        }
    }, [setFieldValue]);

    const handleCountryChange = useCallback(
        (val: number | undefined, name: 'country') => {
            setFieldValue(val, name);
            setFieldValue(undefined, 'district');
        },
        [setFieldValue],
    );

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

    const userRendererParams = useCallback((userId: number, user: User) => ({
        userId,
        user,
    }), []);

    const error = getErrorObject(formError);

    return (
        <div className={styles.operationOverview}>
            <Container
                heading={strings.drefFormSharingHeading}
                childrenContainerClassName={styles.content}
            >
                <InputSection
                    title={strings.drefShareApplicationLabel}
                    description={strings.drefShareApplicationDescription}
                    numPreferredColumns={1}
                >
                    <List
                        className={styles.userList}
                        messageClassName={styles.message}
                        data={drefUsers}
                        renderer={UserItem}
                        keySelector={userKeySelector}
                        rendererParams={userRendererParams}
                        emptyMessage={strings.userListEmptyMessage}
                        errored={false}
                        filtered={false}
                        pending={false}
                        compact
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.drefFormEssentialInformation}
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
                {value?.type_of_dref !== TYPE_LOAN && (
                    <CopyFieldReportSection
                        value={value}
                        setFieldValue={setFieldValue}
                        disabled={disabled}
                        setDistrictOptions={setDistrictOptions}
                        fieldReportOptions={fieldReportOptions}
                        setFieldReportOptions={setFieldReportOptions}
                    />
                )}
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
                <Container>
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
                        {(
                            value?.disaster_type === DISASTER_FIRE
                            || value?.disaster_type === DISASTER_FLASH_FLOOD
                            || value?.disaster_type === DISASTER_FLOOD) ? (
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
                            )}

                        <SelectInput
                            name="disaster_category"
                            label={(
                                <>
                                    {/* FIXME: use string template */}
                                    {value?.type_of_dref === TYPE_IMMINENT

                                        ? strings.drefFormImminentDisasterCategoryLabel
                                        : strings.drefFormDisasterCategoryLabel}
                                    <Link
                                        title={strings.drefFormClickEmergencyResponseFrameworkLabel}
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
                    {(
                        value?.disaster_category === DISASTER_CATEGORY_ORANGE
                        || value?.disaster_category === DISASTER_CATEGORY_RED)
                        && (
                            <InputSection title={strings.drefFormUploadCrisisDocument}>
                                <GoSingleFileInput
                                    name="disaster_category_analysis"
                                    accept=".pdf, .docx, .pptx"
                                    fileIdToUrlMap={fileIdToUrlMap}
                                    onChange={setFieldValue}
                                    url="/api/v2/dref-files/"
                                    value={value.disaster_category_analysis}
                                    error={error?.disaster_category_analysis}
                                    setFileIdToUrlMap={setFileIdToUrlMap}
                                    clearable
                                    disabled={disabled}
                                >
                                    {strings.drefFormUploadDocumentButtonLabel}
                                </GoSingleFileInput>
                            </InputSection>
                        )}
                </Container>
                <InputSection
                    title={
                        value?.type_of_dref !== TYPE_IMMINENT
                            ? strings.drefFormAffectedCountryAndProvinceImminent
                            : strings.drefFormRiskCountryLabel
                    }
                    numPreferredColumns={2}
                >
                    <CountrySelectInput
                        name="country"
                        label={strings.drefFormAddCountry}
                        value={value?.country}
                        onChange={handleCountryChange}
                        error={error?.country}
                        disabled={disabled}
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
                <InputSection
                    title={strings.drefFormTitle}
                    withAsteriskOnTitle
                >
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
                {value?.type_of_dref !== TYPE_LOAN && (
                    <InputSection
                        title={strings.drefFormEmergencyAppealPlanned}
                    >
                        <BooleanInput
                            name="emergency_appeal_planned"
                            value={value?.emergency_appeal_planned}
                            onChange={setFieldValue}
                            error={error?.emergency_appeal_planned}
                            disabled={disabled}
                        />
                    </InputSection>
                )}
                {value?.type_of_dref !== TYPE_LOAN && (
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
                )}
                {value?.type_of_dref !== TYPE_LOAN && (
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
                )}
            </Container>
        </div>
    );
}

export default Overview;
