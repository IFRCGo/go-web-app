import {
    type Dispatch,
    type SetStateAction,
    useCallback,
    useMemo,
} from 'react';
import {
    ShareLineIcon,
    WikiHelpSectionLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    InputSection,
    List,
    SelectInput,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import DistrictSearchMultiSelectInput, { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import DrefShareModal from '#components/domain/DrefShareModal';
import UserItem from '#components/domain/DrefShareModal/UserItem';
import ImageWithCaptionInput from '#components/domain/ImageWithCaptionInput';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import { type User } from '#components/domain/UserSearchMultiSelectInput';
import Link from '#components/Link';
import useCountry from '#hooks/domain/useCountry';
import useDisasterType from '#hooks/domain/useDisasterType';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useInputState from '#hooks/useInputState';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import {
    TYPE_IMMINENT,
    TYPE_LOAN,
} from '../common';
import { type PartialFinalReport } from '../schema';

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

const userKeySelector = (item: User) => item.id;

interface Props {
    value: PartialFinalReport;
    setFieldValue: (...entries: EntriesAsList<PartialFinalReport>) => void;
    error: Error<PartialFinalReport> | undefined;
    disabled?: boolean;
    isPreviousImminent: boolean;

    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    districtOptions: DistrictItem[] | null | undefined;
    setDistrictOptions: Dispatch<SetStateAction<DistrictItem[] | null | undefined>>;
    drefId: number | undefined;
}

function Overview(props: Props) {
    const {
        value,
        setFieldValue,
        isPreviousImminent,
        error: formError,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        disabled,
        districtOptions,
        setDistrictOptions,
        drefId,
    } = props;

    const strings = useTranslation(i18n);
    const [drefUsers, setDrefUsers] = useInputState<User[] | undefined | null>([]);
    const [showShareModal, {
        setTrue: setShowShareModalTrue,
        setFalse: setShowShareModalFalse,
    }] = useBooleanState(false);
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

    const userRendererParams = useCallback((userId: number, user: User) => ({
        userId,
        user,
    }), []);

    const imminentFilteredTypeOfDrefOptions = useMemo(() => (
        typeOfDrefOptions?.filter(
            (option) => option.key !== TYPE_LOAN,
        )
    ), [typeOfDrefOptions]);

    const filteredTypeOfDrefOptions = useMemo(() => (
        typeOfDrefOptions?.filter(
            (option) => option.key !== TYPE_LOAN && option.key !== TYPE_IMMINENT,
        )
    ), [typeOfDrefOptions]);

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

    const error = getErrorObject(formError);

    return (
        <div className={styles.operationOverview}>
            <Container
                heading={strings.drefFormSharingHeading}
                childrenContainerClassName={styles.content}
            >
                <InputSection
                    title={strings.drefOperationalShareApplicationLabel}
                    description={strings.drefOperationalShareApplicationDescription}
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
                        disabled={isNotDefined(drefId)}
                        variant="secondary"
                        icons={<ShareLineIcon />}
                    >
                        {strings.formShareButtonLabel}
                    </Button>
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
                <InputSection
                    title={strings.drefFormDrefTypeTitle}
                    numPreferredColumns={2}
                    withAsteriskOnTitle
                >
                    <SelectInput
                        name="type_of_dref"
                        label={strings.drefFormTypeOfDref}
                        options={
                            isPreviousImminent ? imminentFilteredTypeOfDrefOptions
                                : filteredTypeOfDrefOptions
                        }
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
                <InputSection
                    title={
                        value?.type_of_dref !== TYPE_IMMINENT
                            ? strings.drefFormAffectedCountryAndProvince
                            : strings.drefFormRiskCountryLabelImminent
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
            {showShareModal && isDefined(drefId) && (
                <DrefShareModal
                    onCancel={setShowShareModalFalse}
                    onSuccess={handleUserShareSuccess}
                    drefId={drefId}
                />
            )}
        </div>
    );
}

export default Overview;
