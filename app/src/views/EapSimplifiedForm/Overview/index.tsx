import {
    useCallback,
    useMemo,
} from 'react';
import { useParams } from 'react-router-dom';
import {
    AddLineIcon,
    ShareLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    Description,
    InputSection,
    Label,
    ListView,
    NumberInput,
    RawList,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';

import ContactInputsSection from '#components/domain/ContactInputsSection';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import EapShareModal from '#components/domain/EapShareModal';
import UserItem from '#components/domain/EapShareModal/UserItem';
import ImageWithCaptionInput from '#components/domain/ImageWithCaptionInput';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import { type User } from '#components/domain/UserSearchMultiSelectInput';
import NonFieldError from '#components/NonFieldError';
import TabPage from '#components/TabPage';
import useInputState from '#hooks/useInputState';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import PartnerContactsInput from '../PartnerContactInput';
import { type PartialSimplifiedEapType } from '../schema';

import i18n from './i18n.json';

type EapRegistrationDetails = GoApiResponse<'/api/v2/eap-registration/{id}/'>;
type PartnerContactFormFields = NonNullable<PartialSimplifiedEapType['partner_contacts']>[number];

interface Props {
    value: PartialSimplifiedEapType;
    setFieldValue: (...entries: EntriesAsList<PartialSimplifiedEapType>) => void;
    error: Error<PartialSimplifiedEapType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    eapRegistrationDetail?: EapRegistrationDetails;
    readOnly?: boolean;
}

const userKeySelector = (item: User) => item.id;

function Overview(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        eapRegistrationDetail,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);
    const { eapId } = useParams<{ eapId: string }>();
    const [eapUsers, setEapUsers] = useInputState<User[] | undefined | null>([]);

    const [showShareModal, {
        setTrue: setShowShareModalTrue,
        setFalse: setShowShareModalFalse,
    }] = useBooleanState(false);

    const {
        retrigger: getEapUsers,
    } = useRequest({
        skip: isNotDefined(eapId),
        url: '/api/v2/eap-share-users/{id}/',
        pathVariables: { id: Number(eapId) },
        onSuccess: (response) => {
            setEapUsers(response.users_details);
        },
    });

    const noOp = () => {};

    const {
        setValue: onPartnerContactChange,
        removeValue: onPartnerContactRemove,
    } = useFormArray<'partner_contacts', PartnerContactFormFields>(
        'partner_contacts',
        setFieldValue,
    );

    const handleUserShareSuccess = useCallback(() => {
        setShowShareModalFalse();
        getEapUsers();
    }, [
        getEapUsers,
        setShowShareModalFalse,
    ]);

    const handlePartnerContactAdd = useCallback(() => {
        const newPartnerContactItem: PartnerContactFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: PartnerContactFormFields[] | undefined) => (
                [...(oldValue ?? []), newPartnerContactItem]
            ),
            'partner_contacts' as const,
        );
    }, [setFieldValue]);

    const userRendererParams = useCallback((userId: number, user: User) => ({
        userId,
        user,
    }), []);

    const isSharing = useMemo(
        () => isDefined(eapRegistrationDetail)
        && isDefined(eapRegistrationDetail.latest_simplified_eap),
        [eapRegistrationDetail],
    );

    return (
        <TabPage
            spacingOffset={-2}
            sectionCriteriaHeading={strings.overviewSectionHeading}
            sectionCriteriaContent={(
                <ListView withSpacingOpticalCorrection layout="block">
                    <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                        <Label strong>
                            {strings.sectionCriteriaIntroduction11}
                        </Label>
                        <Label strong>
                            {strings.sectionCriteriaIntroduction12}
                        </Label>
                    </ListView>
                    <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                        <Description>
                            {strings.sectionCriteriaComment11}
                        </Description>
                        <Description>
                            {strings.sectionCriteriaComment12}
                        </Description>
                    </ListView>
                </ListView>
            )}
        >
            {isSharing && (
                <Container
                    heading={strings.eapFormSharingHeading}
                    variant="form"
                >
                    <InputSection
                        title={strings.eapShareApplicationLabel}
                        description={strings.eapShareApplicationDescription}
                        numPreferredColumns={1}
                    >
                        <Container
                            headerActions={(
                                <Button
                                    name={undefined}
                                    onClick={setShowShareModalTrue}
                                    before={<ShareLineIcon />}
                                    disabled={isNotDefined(eapId) || readOnly}
                                >
                                    {strings.formShareButtonLabel}
                                </Button>
                            )}
                            emptyMessage={strings.userListEmptyMessage}
                            empty={!eapUsers || eapUsers.length === 0}
                        >
                            <ListView
                                spacing="sm"
                                withWrap
                            >
                                <RawList
                                    data={eapUsers}
                                    renderer={UserItem}
                                    keySelector={userKeySelector}
                                    rendererParams={userRendererParams}
                                />
                            </ListView>
                        </Container>
                        {showShareModal && isDefined(eapId) && (
                            <EapShareModal
                                onCancel={setShowShareModalFalse}
                                onSuccess={handleUserShareSuccess}
                                eapId={Number(eapId)}
                            />
                        )}
                    </InputSection>
                </Container>
            )}
            <Container
                heading={strings.detailsHeading}
                variant="form"
            >
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.nationalSociety}
                        description={strings.nationalSocietyDescription}
                        withAsteriskOnTitle
                        numPreferredColumns={2}
                    >
                        <NationalSocietySelectInput
                            name="national_society"
                            onChange={noOp}
                            value={eapRegistrationDetail?.national_society}
                            disabled={disabled}
                            readOnly
                        />
                    </InputSection>
                    <InputSection
                        title={strings.country}
                        description={strings.countryDescription}
                        withAsteriskOnTitle
                        numPreferredColumns={2}
                    >
                        <CountrySelectInput
                            name="country"
                            value={eapRegistrationDetail?.country}
                            onChange={noOp}
                            disabled={disabled}
                            readOnly
                        />
                    </InputSection>
                    <InputSection
                        title={strings.disasterType}
                        description={strings.disasterTypeDescription}
                        withAsteriskOnTitle
                        numPreferredColumns={2}
                    >
                        <DisasterTypeSelectInput
                            name="disaster_type"
                            value={eapRegistrationDetail?.disaster_type}
                            onChange={noOp}
                            disabled={disabled}
                            readOnly
                        />
                    </InputSection>
                    <InputSection
                        title={strings.uploadCoverImage}
                        description={strings.uploadCoverImageDescription}
                        withAsteriskOnTitle
                        numPreferredColumns={2}
                    >
                        <ImageWithCaptionInput
                            name="cover_image_file"
                            url="/api/v2/eap-file/"
                            value={value?.cover_image_file}
                            onChange={setFieldValue}
                            error={getErrorObject(error?.cover_image_file)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.timeframe}
                        description={strings.timeframeDescription}
                        withAsteriskOnTitle
                        numPreferredColumns={2}
                    >
                        <NumberInput
                            name="seap_timeframe"
                            value={value?.seap_timeframe}
                            onChange={setFieldValue}
                            error={error?.seap_timeframe}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                    </InputSection>
                </ListView>
            </Container>
            <Container
                heading={strings.contacts}
                variant="form"
            >
                <ListView
                    layout="block"
                    spacing="lg"
                >
                    <Container
                        heading={strings.nationalHeader}
                        headingLevel={4}
                        variant="form"
                    >
                        <ListView
                            layout="block"
                            spacing="sm"
                        >
                            <ContactInputsSection
                                title={strings.nSContact}
                                description={strings.nSContactDescription}
                                namePrefix="national_society_contact"
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                disabled={disabled}
                                readOnly={readOnly}
                                withRequiredNameAndEmail
                            />
                            <InputSection
                                title={strings.partnerNS}
                                description={strings.partnerNSDescription}
                            >
                                <NonFieldError error={getErrorObject(error?.partner_contacts)} />
                                <Container
                                    empty={isNotDefined(value.partner_contacts)
                                        || value.partner_contacts?.length === 0}
                                    emptyMessage={strings.partnerNsEmptyMessage}
                                    withCompactMessage
                                >
                                    <ListView
                                        spacing="sm"
                                        layout="block"
                                    >
                                        {value.partner_contacts?.map((contact, index) => (
                                            <PartnerContactsInput
                                                key={contact.client_id}
                                                index={index}
                                                value={contact}
                                                onChange={onPartnerContactChange}
                                                onRemove={onPartnerContactRemove}
                                                error={getErrorObject(error?.partner_contacts)}
                                                disabled={disabled}
                                                readOnly={readOnly}
                                            />
                                        ))}
                                    </ListView>
                                </Container>
                                <Button
                                    name={undefined}
                                    onClick={handlePartnerContactAdd}
                                    disabled={disabled || readOnly}
                                    before={<AddLineIcon />}
                                >
                                    {strings.addPartnerNSContactButton}
                                </Button>
                            </InputSection>
                        </ListView>
                    </Container>
                    <Container
                        heading={strings.delegationHeader}
                        headingLevel={4}
                        variant="form"
                    >
                        <ListView
                            layout="block"
                            spacing="sm"
                        >
                            <ContactInputsSection
                                title={strings.focalPoint}
                                namePrefix="ifrc_delegation_focal_point"
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                disabled={disabled}
                                readOnly={readOnly}
                                withRequiredNameAndEmail
                            />
                            <ContactInputsSection
                                title={strings.delegation}
                                namePrefix="ifrc_head_of_delegation"
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                disabled={disabled}
                                readOnly={readOnly}
                                withRequiredNameAndEmail
                            />
                        </ListView>
                    </Container>
                    <Container
                        heading={strings.regionalHeader}
                        headingLevel={4}
                        variant="form"
                    >
                        <ListView
                            layout="block"
                            spacing="sm"
                        >
                            <ContactInputsSection
                                title={strings.drefFocalPoint}
                                description={strings.drefFocalPointDescription}
                                namePrefix="dref_focal_point"
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <ContactInputsSection
                                title={strings.regionalFocalPoint}
                                namePrefix="ifrc_regional_focal_point"
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <ContactInputsSection
                                title={strings.regionalManager}
                                namePrefix="ifrc_regional_ops_manager"
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <ContactInputsSection
                                title={strings.regionalHead}
                                namePrefix="ifrc_regional_head_dcc"
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <ContactInputsSection
                                title={strings.regionalCoordinator}
                                namePrefix="ifrc_global_ops_coordinator"
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                        </ListView>
                    </Container>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default Overview;
