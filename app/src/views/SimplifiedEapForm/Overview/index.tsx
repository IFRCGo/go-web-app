import {
    Container,
    InputSection,
    ListView,
    NumberInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    type PartialForm,
} from '@togglecorp/toggle-form';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import ImageWithCaptionInput from '#components/domain/ImageWithCaptionInput';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import TabPage from '#components/TabPage';
import { type GoApiBody } from '#utils/restRequest';

import ContactInputsSection from '../ContactInputsSection';
import { type PartialSimplifiedEapType } from '../schema';

import i18n from './i18n.json';

type EapRegisterRequestBody = GoApiBody<'/api/v2/eap-registration/', 'POST'>;
type FormFields = PartialForm<EapRegisterRequestBody>;

interface Props {
    value: PartialSimplifiedEapType;
    setFieldValue: (...entries: EntriesAsList<PartialSimplifiedEapType>) => void;
    error: Error<PartialSimplifiedEapType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    eapRegistrationDetail?: FormFields;
    readOnly?: boolean;
}

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

    const noOp = () => {};

    return (
        <TabPage>
            <Container
                heading={strings.detailsHeading}
                spacing="lg"
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
                spacing="lg"
            >
                <ListView
                    layout="block"
                    spacing="lg"
                >
                    <Container
                        heading={strings.nationalHeader}
                        headingLevel={4}
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
                            />
                            <ContactInputsSection
                                title={strings.partnerNS}
                                description={strings.partnerNSDescription}
                                namePrefix="partner_ns"
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                        </ListView>
                    </Container>
                    <Container
                        heading={strings.delegationHeader}
                        headingLevel={4}
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
                            />
                            <ContactInputsSection
                                title={strings.delegation}
                                namePrefix="ifrc_head_of_delegation"
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                        </ListView>
                    </Container>
                    <Container
                        heading={strings.regionalHeader}
                        headingLevel={4}
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
