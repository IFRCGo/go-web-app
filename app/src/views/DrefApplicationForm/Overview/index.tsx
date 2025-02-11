import {
    type Dispatch,
    type SetStateAction,
    useCallback,
} from 'react';
import { useParams } from 'react-router-dom';
import {
    ShareLineIcon,
    WikiHelpSectionLineIcon,
} from '@ifrc-go/icons';
import {
    BooleanInput,
    Button,
    Container,
    InputSection,
    List,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    addNumDaysToDate,
    addNumMonthsToDate,
    ceilToEndOfMonth,
    encodeDate,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
    type SetBaseValueArg,
} from '@togglecorp/toggle-form';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import DistrictSearchMultiSelectInput, { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import DrefShareModal from '#components/domain/DrefShareModal';
import UserItem from '#components/domain/DrefShareModal/UserItem';
import { type FieldReportItem as FieldReportSearchItem } from '#components/domain/FieldReportSearchSelectInput';
import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import ImageWithCaptionInput from '#components/domain/ImageWithCaptionInput';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import { type User } from '#components/domain/UserSearchMultiSelectInput';
import Link from '#components/Link';
import useCountry from '#hooks/domain/useCountry';
import useDisasterType from '#hooks/domain/useDisasterType';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useInputState from '#hooks/useInputState';
import {
    DISASTER_CATEGORY_ORANGE,
    DISASTER_CATEGORY_RED,
} from '#utils/constants';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import {
    DISASTER_FIRE,
    DISASTER_FLASH_FLOOD,
    DISASTER_FLOOD,
    EARLY_ACTION,
    EARLY_RESPONSE,
    ONSET_SUDDEN,
    OPERATION_TIMEFRAME_IMMINENT,
    TYPE_IMMINENT,
    TYPE_LOAN,
} from '../common';
import { type PartialDref } from '../schema';
import CopyFieldReportSection from './CopyFieldReportSection';

import i18n from './i18n.json';
import styles from './styles.module.css';

const disasterCategoryLink = 'https://ifrcorg.sharepoint.com/:u:/r/sites/DisastersClimateandCrises/SitePages/Emergency-Response-Framework.aspx?csf=1&web=1&e=WWGByn';

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
    setValue: (value: SetBaseValueArg<PartialDref>, partialUpdate?: boolean) => void;
    error: Error<PartialDref> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    districtOptions: DistrictItem[] | null | undefined;
    setDistrictOptions: Dispatch<SetStateAction<DistrictItem[] | null | undefined>>;

    fieldReportOptions: FieldReportSearchItem[] | null | undefined;
    setFieldReportOptions: Dispatch<SetStateAction<FieldReportSearchItem[] | null | undefined>>;
}

const userKeySelector = (item: User) => item.id;

function Overview(props: Props) {
    const {
        value,
        setFieldValue,
        setValue,
        error: formError,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        disabled,
        districtOptions,
        setDistrictOptions,
        fieldReportOptions,
        setFieldReportOptions,
    } = props;

    const strings = useTranslation(i18n);

    const {
        dref_dref_dref_type: typeOfDrefOptions,
        dref_dref_disaster_category: drefDisasterCategoryOptions,
        dref_dref_onset_type: drefOnsetTypeOptions,
    } = useGlobalEnums();

    const countryOptions = useCountry();
    const { drefId } = useParams<{ drefId: string }>();
    const [drefUsers, setDrefUsers] = useInputState<User[] | undefined | null>([]);

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

    const handleTypeofDrefChange = useCallback((
        typeOfDref: DrefTypeOption['key'] | undefined,
        name: 'type_of_dref',
    ) => {
        setFieldValue(typeOfDref, name);
        if (typeOfDref === TYPE_IMMINENT) {
            setValue((oldValue) => {
                const endDate = ceilToEndOfMonth(
                    addNumDaysToDate(
                        oldValue.date_of_approval,
                        oldValue.operation_timeframe_imminent,
                    ),
                );
                return {
                    ...oldValue,
                    type_of_onset: ONSET_SUDDEN,
                    operation_timeframe_imminent: OPERATION_TIMEFRAME_IMMINENT,
                    end_date: isDefined(endDate) ? encodeDate(endDate) : undefined,
                    proposed_action: isNotDefined(oldValue.proposed_action)
                        || oldValue.proposed_action.length < 1 ? [
                            {
                                client_id: randomString(),
                                proposed_type: EARLY_ACTION,
                            },
                            {
                                client_id: randomString(),
                                proposed_type: EARLY_RESPONSE,
                            },
                        ] : oldValue.proposed_action,
                };
            });
        } else {
            setValue((oldValue) => {
                const endDate = addNumMonthsToDate(
                    oldValue.date_of_approval,
                    oldValue.operation_timeframe,
                );
                return {
                    ...oldValue,
                    end_date: endDate,
                };
            });
        }
    }, [setFieldValue, setValue]);

    const userRendererParams = useCallback((userId: number, user: User) => ({
        userId,
        user,
    }), []);

    const error = getErrorObject(formError);
    const [showShareModal, {
        setTrue: setShowShareModalTrue,
        setFalse: setShowShareModalFalse,
    }] = useBooleanState(false);

    const {
        retrigger: getDrefUsers,
    } = useRequest({
        skip: isNotDefined(drefId),
        url: '/api/v2/dref-share-user/{id}/',
        pathVariables: { id: Number(drefId) },
        onSuccess: (response) => {
            setDrefUsers(response.users_details);
        },
    });

    const handleUserShareSuccess = useCallback(() => {
        setShowShareModalFalse();
        getDrefUsers();
    }, [
        getDrefUsers,
        setShowShareModalFalse,
    ]);

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
                    <Button
                        name={undefined}
                        onClick={setShowShareModalTrue}
                        variant="secondary"
                        icons={<ShareLineIcon />}
                    >
                        {strings.formShareButtonLabel}
                    </Button>
                    {showShareModal && isDefined(drefId) && (
                        <DrefShareModal
                            onCancel={setShowShareModalFalse}
                            onSuccess={handleUserShareSuccess}
                            drefId={Number(drefId)}
                        />
                    )}
                </InputSection>
            </Container>
            <Container
                heading={strings.drefFormEssentialInformation}
                childrenContainerClassName={styles.content}
            >
                <InputSection
                    title={strings.drefFormNationalSociety}
                    description={strings.drefFormNationalSocietyDescription}
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
                        onChange={handleTypeofDrefChange}
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
                            readOnly={
                                value?.type_of_dref === TYPE_IMMINENT
                            }
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
                        {value?.type_of_dref !== TYPE_IMMINENT && (
                            <SelectInput
                                name="disaster_category"
                                label={(
                                    <>
                                        {strings.drefFormDisasterCategoryLabel}
                                        <Link
                                            title={strings.drefFormClickEmergencyResponseLabel}
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
                        )}
                    </InputSection>
                    {(
                        value?.disaster_category === DISASTER_CATEGORY_ORANGE
                        || value?.disaster_category === DISASTER_CATEGORY_RED)
                        && value?.type_of_dref !== TYPE_IMMINENT && (
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
                                {strings.drefFormOverviewUploadDocumentButtonLabel}
                            </GoSingleFileInput>
                        </InputSection>
                    )}
                </Container>
                <InputSection
                    title={
                        value?.type_of_dref !== TYPE_IMMINENT
                            ? strings.drefFormAffectedCountryAndProvince
                            : strings.drefFormRiskCountryLabelImminent
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
                {value?.type_of_dref !== TYPE_LOAN && value?.type_of_dref !== TYPE_IMMINENT && (
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
                {value?.type_of_dref !== TYPE_LOAN && value?.type_of_dref !== TYPE_IMMINENT && (
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
