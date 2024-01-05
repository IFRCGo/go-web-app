import {
    useCallback,
    type SetStateAction,
    type Dispatch,
} from 'react';
import {
    useLocation,
} from 'react-router-dom';
import {
    type Error,
    getErrorObject,
    getErrorString,
    type EntriesAsList,
} from '@togglecorp/toggle-form';
import {
    isNotDefined,
} from '@togglecorp/fujs';
import { WikiHelpSectionLineIcon } from '@ifrc-go/icons';

import BooleanInput from '#components/BooleanInput';
import Button from '#components/Button';
import Container from '#components/Container';
import InputSection from '#components/InputSection';
import Link from '#components/Link';
import Modal from '#components/Modal';
import NumberInput from '#components/NumberInput';
import SelectInput from '#components/SelectInput';
import TextInput from '#components/TextInput';
import useTranslation from '#hooks/useTranslation';
import { type GoApiResponse } from '#utils/restRequest';
import {
    stringValueSelector,
} from '#utils/selectors';
import useBooleanState from '#hooks/useBooleanState';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useCountry from '#hooks/domain/useCountry';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import DistrictSearchMultiSelectInput, {
    type DistrictItem,
} from '#components/domain/DistrictSearchMultiSelectInput';
import UserItem from '#components/domain/DrefShareModal/UserItem';
import ImageWithCaptionInput from '#components/domain/ImageWithCaptionInput';
import List from '#components/List';
import useDisasterType from '#hooks/domain/useDisasterType';
import { type User } from '#components/domain/UserSearchMultiSelectInput';

import {
    DISASTER_FIRE,
    DISASTER_FLOOD,
    DISASTER_FLASH_FLOOD,
    TYPE_IMMINENT,
    TYPE_LOAN,
    TYPE_RESPONSE,
    ONSET_SUDDEN,
    TYPE_ASSESSMENT,
} from '../common';
import { type PartialOpsUpdate } from '../schema';
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

const userKeySelector = (item: User) => item.id;

interface Props {
    value: PartialOpsUpdate;
    setFieldValue: (...entries: EntriesAsList<PartialOpsUpdate>) => void;
    error: Error<PartialOpsUpdate> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    districtOptions: DistrictItem[] | null | undefined;
    setDistrictOptions: Dispatch<SetStateAction<DistrictItem[] | null | undefined>>;
    drefUsers?: User[] | null;
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
        drefUsers,
    } = props;
    const { state } = useLocation();

    const strings = useTranslation(i18n);
    const {
        dref_dref_dref_type: typeOfDrefOptions,
        dref_dref_disaster_category: drefDisasterCategoryOptions,
        dref_dref_onset_type: drefOnsetTypeOptions,
    } = useGlobalEnums();

    const countryOptions = useCountry();

    const disasterTypes = useDisasterType();

    const [
        showChangeDrefTypeModal,
        {
            setFalse: setShowChangeDrefTypeModalFalse,
        },
    ] = useBooleanState(true);

    const handleTypeOfOnsetChange = useCallback((
        typeOfOnset: OnsetTypeOption['key'] | undefined,
        name: 'type_of_onset',
    ) => {
        setFieldValue(typeOfOnset, name);
        if (typeOfOnset === ONSET_SUDDEN) {
            setFieldValue(false, 'emergency_appeal_planned');
        }
    }, [setFieldValue]);

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

    const error = getErrorObject(formError);

    return (
        <div className={styles.operationOverview}>
            {state?.isNewOpsUpdate
                && showChangeDrefTypeModal
                && (value?.type_of_dref === TYPE_IMMINENT
                || value?.type_of_dref === TYPE_ASSESSMENT) && (
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
                    className={styles.flashUpdateShareModal}
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
                <InputSection
                    title={strings.drefFormDrefTypeTitle}
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
                        onChange={handleTypeOfOnsetChange}
                        error={error?.type_of_onset}
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
                            className={styles.titleInput}
                            name="title"
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
        </div>
    );
}

export default Overview;
