import {
    type Dispatch,
    type SetStateAction,
    useCallback,
    useMemo,
} from 'react';
import {
    useLocation,
    useParams,
} from 'react-router-dom';
import {
    ErrorWarningFillIcon,
    ShareLineIcon,
    WikiHelpSectionLineIcon,
} from '@ifrc-go/icons';
import {
    BooleanInput,
    Button,
    Container,
    InputSection,
    List,
    Modal,
    NumberInput,
    SelectInput,
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
    DISASTER_FIRE,
    DISASTER_FLASH_FLOOD,
    DISASTER_FLOOD,
    TYPE_ASSESSMENT,
    TYPE_IMMINENT,
    TYPE_LOAN,
    TYPE_RESPONSE,
} from '../common';
import { type PartialOpsUpdate } from '../schema';

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
    value: PartialOpsUpdate;
    readOnly: boolean;
    isPreviousImminent: boolean;
    setFieldValue: (...entries: EntriesAsList<PartialOpsUpdate>) => void;
    error: Error<PartialOpsUpdate> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    districtOptions: DistrictItem[] | null | undefined;
    setDistrictOptions: Dispatch<SetStateAction<DistrictItem[] | null | undefined>>;
    drefId: number | undefined;
    geoWarning: string | undefined;
}

function Overview(props: Props) {
    const {
        value,
        readOnly,
        isPreviousImminent,
        setFieldValue,
        error: formError,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        disabled,
        districtOptions,
        setDistrictOptions,
        drefId,
        geoWarning,
    } = props;
    const { state } = useLocation();
    const { opsUpdateId } = useParams<{ opsUpdateId: string }>();
    const [drefUsers, setDrefUsers] = useInputState<User[] | undefined | null>([]);

    const strings = useTranslation(i18n);
    const {
        dref_dref_dref_type: typeOfDrefOptions,
        dref_dref_disaster_category: drefDisasterCategoryOptions,
        dref_dref_onset_type: drefOnsetTypeOptions,
    } = useGlobalEnums();

    const typeOfDrefOptionsWithoutImminent = useMemo(() => (
        typeOfDrefOptions?.filter((option) => option.key !== TYPE_IMMINENT)
    ), [typeOfDrefOptions]);

    const countryOptions = useCountry();

    const disasterTypes = useDisasterType();

    const [
        showChangeDrefTypeModal,
        {
            setFalse: setShowChangeDrefTypeModalFalse,
        },
    ] = useBooleanState(true);

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

    const handleChangeToResponse = useCallback(() => {
        setFieldValue(TYPE_RESPONSE, 'type_of_dref');
        setShowChangeDrefTypeModalFalse();
    }, [setFieldValue, setShowChangeDrefTypeModalFalse]);

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

    const [showShareModal, {
        setTrue: setShowShareModalTrue,
        setFalse: setShowShareModalFalse,
    }] = useBooleanState(false);

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
            {state?.isNewOpsUpdate
                && !isPreviousImminent
                && showChangeDrefTypeModal
                && value?.type_of_dref === TYPE_ASSESSMENT && (
                <Modal
                    size="sm"
                    heading={strings.changeToResponseHeading}
                    onClose={setShowChangeDrefTypeModalFalse}
                    footerActions={(
                        <>
                            <Button
                                name={undefined}
                                variant="secondary"
                                onClick={setShowChangeDrefTypeModalFalse}
                            >
                                {strings.noLabel}
                            </Button>
                            <Button
                                name={undefined}
                                onClick={handleChangeToResponse}
                            >
                                {strings.yesLabel}
                            </Button>
                        </>
                    )}
                >
                    {strings.isDrefChangingToResponse}
                </Modal>
            )}
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
                        disabled={isNotDefined(opsUpdateId) || readOnly}
                        icons={<ShareLineIcon />}
                        variant="secondary"
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
                        readOnly={readOnly}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormDrefTypeTitle}
                    withAsteriskOnTitle
                >
                    <SelectInput
                        name="type_of_dref"
                        label={strings.drefFormTypeOfDref}
                        options={
                            isPreviousImminent
                                ? typeOfDrefOptions
                                : typeOfDrefOptionsWithoutImminent
                        }
                        keySelector={typeOfDrefKeySelector}
                        labelSelector={stringValueSelector}
                        onChange={setFieldValue}
                        value={value?.type_of_dref}
                        error={error?.type_of_dref}
                        readOnly={readOnly}
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
                        readOnly={readOnly}
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
                        readOnly={readOnly}
                        disabled={disabled}
                        withAsterisk
                    />
                    {(value?.disaster_type === DISASTER_FIRE
                        || value?.disaster_type === DISASTER_FLASH_FLOOD
                        || value?.disaster_type === DISASTER_FLOOD)
                        ? (
                            <BooleanInput
                                name="is_man_made_event"
                                label={strings.drefFormManMadeEvent}
                                value={value?.is_man_made_event}
                                onChange={setFieldValue}
                                error={error?.is_man_made_event}
                                readOnly={readOnly}
                                disabled={disabled}
                            />
                        ) : (
                            <div />
                        )}
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
                        readOnly={readOnly}
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
                >
                    <CountrySelectInput
                        name="country"
                        label={strings.drefFormAddCountry}
                        value={value?.country}
                        onChange={handleCountryChange}
                        error={error?.country}
                        readOnly={readOnly}
                        disabled={disabled}
                    />
                    <div>
                        <DistrictSearchMultiSelectInput
                            name="district"
                            countryId={value.country}
                            label={strings.drefFormAddRegion}
                            options={districtOptions}
                            onChange={setFieldValue}
                            value={value?.district}
                            readOnly={readOnly}
                            disabled={disabled}
                            onOptionsChange={setDistrictOptions}
                            error={getErrorString(error?.district)}
                        />
                        {geoWarning && (
                            <div className={styles.warning}>
                                <ErrorWarningFillIcon className={styles.icon} />
                                {geoWarning}
                            </div>
                        )}
                    </div>
                </InputSection>
                <InputSection
                    title={strings.drefFormTitle}
                    withAsteriskOnTitle
                >
                    <div className={styles.titleContainer}>
                        <TextInput
                            className={styles.titleInput}
                            name="title"
                            value={value?.title}
                            onChange={setFieldValue}
                            error={error?.title}
                            readOnly={readOnly}
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
                                || readOnly
                            )}
                        >
                            {strings.drefFormGenerateTitle}
                        </Button>
                    </div>
                </InputSection>

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
                            readOnly={readOnly}
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
                            readOnly={readOnly}
                            disabled={disabled}
                        />
                    </InputSection>
                )}
                {value?.type_of_dref !== TYPE_LOAN && (
                    <InputSection
                        title={strings.drefOperationalUpdateNumber}
                        numPreferredColumns={2}
                    >
                        <NumberInput
                            readOnly
                            name="operational_update_number"
                            value={value.operational_update_number}
                            onChange={undefined}
                            error={error?.operational_update_number}
                            disabled={disabled}
                        />
                    </InputSection>
                )}
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
