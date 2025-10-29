import {
    Container,
    InputSection,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import MultiImageWithCaptionInput from '#components/domain/MultiImageWithCaptionInput';

import { type PartialSimplifiedEapType } from '../schema';

import i18n from './i18n.json';

interface Props {
    value: PartialSimplifiedEapType;
    setFieldValue: (...entries: EntriesAsList<PartialSimplifiedEapType>) => void;
    error: Error<PartialSimplifiedEapType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

function RiskAnalysis(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
    } = props;

    const error = getErrorObject(formError);
    const strings = useTranslation(i18n);

    return (
        <>
            <Container
                heading={strings.simplifiedEapRiskHeading}
            >
                <InputSection
                    title={strings.simplifiedHistoricalImpact}
                    description={strings.simplifiedEapRiskDescription}
                    withAsteriskOnTitle
                >
                    <TextArea
                        label={strings.simplifiedFormDescriptionLabel}
                        name="prioritized_hazard_and_impact"
                        value={value?.prioritized_hazard_and_impact}
                        onChange={setFieldValue}
                        error={error?.prioritized_hazard_and_impact}
                        disabled={disabled}
                    />
                    <MultiImageWithCaptionInput
                        name="hazard_impact_file"
                        url="/api/v2/eap-file/multiple/"
                        value={value?.hazard_impact_file}
                        onChange={setFieldValue}
                        error={getErrorObject(error?.hazard_impact_file)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        label={strings.simplifiedFormUploadlabel}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.simplifiedFormRiskProtocol}
                    description={strings.simplifiedFormRiskProtocolDescription}
                    withAsteriskOnTitle
                >
                    <TextArea
                        label={strings.simplifiedFormDescriptionLabel}
                        name="risks_selected_protocols"
                        value={value?.risks_selected_protocols}
                        onChange={setFieldValue}
                        error={error?.risks_selected_protocols}
                        disabled={disabled}
                    />
                    <MultiImageWithCaptionInput
                        name="risk_selected_protocols_file"
                        url="/api/v2/eap-file/multiple/"
                        value={value?.risk_selected_protocols_file}
                        onChange={setFieldValue}
                        error={getErrorObject(error?.risk_selected_protocols_file)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        label={strings.simplifiedFormUploadlabel}
                        disabled={disabled}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.simplifiedFormEarlyActionSelection}
            >
                <InputSection
                    title={strings.simplifiedFormSelectedEarlyAction}
                    description={strings.simplifiedFormSelectedEarlyActionDescription}
                    withAsteriskOnTitle
                >
                    <TextArea
                        label={strings.simplifiedFormDescriptionLabel}
                        name="selected_early_actions"
                        value={value?.selected_early_actions}
                        onChange={setFieldValue}
                        error={error?.selected_early_actions}
                        disabled={disabled}
                    />
                    <MultiImageWithCaptionInput
                        name="selected_early_actions_file"
                        url="/api/v2/eap-file/multiple/"
                        value={value?.selected_early_actions_file}
                        onChange={setFieldValue}
                        error={getErrorObject(error?.selected_early_actions_file)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        label={strings.simplifiedFormUploadlabel}
                        disabled={disabled}
                    />
                </InputSection>
            </Container>
        </>
    );
}

export default RiskAnalysis;
