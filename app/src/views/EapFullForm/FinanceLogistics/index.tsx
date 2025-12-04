import {
    Container,
    InputSection,
    ListView,
    NumberInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import TabPage from '#components/TabPage';

import { type PartialEapFullFormType } from '../schema';

import i18n from './i18n.json';

interface Props {
    value: PartialEapFullFormType;
    setFieldValue: (...entries: EntriesAsList<PartialEapFullFormType>) => void;
    error: Error<PartialEapFullFormType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

function FinanceLogistics(props: Props) {
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
        <TabPage>
            <Container>
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.eapFullFormBudgetTitle}
                        description={(
                            <ul>
                                <li>{strings.eapFullFormBudgetDescription1}</li>
                                <li>{strings.eapFullFormBudgetDescription2}</li>
                                <li>{strings.eapFullFormBudgetDescription3}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <NumberInput
                            label={strings.eapFullFormTotalBudgetLabel}
                            name="total_budget"
                            value={value?.total_budget}
                            error={error?.total_budget}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                        <TextArea
                            label={strings.eapFullFormFinanceDescriptionLabel}
                            name="budget_description"
                            value={value?.budget_description}
                            error={error?.budget_description}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        description="Download full budget template"
                    >
                        <GoSingleFileInput
                            name="budget_file"
                            accept=".pdf, .docx, .pptx"
                            fileIdToUrlMap={fileIdToUrlMap}
                            onChange={setFieldValue}
                            url="/api/v2/eap-file/"
                            value={value?.budget_file}
                            error={getErrorString(error?.budget_file)}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            required
                            clearable
                            disabled={disabled}
                            useCurrentLanguageForMutation
                            label={strings.eapFullFormFinanceUploadBudgetLabel}
                        >
                            {strings.eapFullFormFinanceUploadButtonLabel}
                        </GoSingleFileInput>
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormReadinessCostTitle}
                        description={(
                            <ul>
                                <li>{strings.eapFullFormReadinessCostDescription1}</li>
                                <li>{strings.eapFullFormReadinessCostDescription2}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <NumberInput
                            label={strings.eapFullFormReadinessBudgetLabel}
                            name="readiness_budget"
                            value={value?.readiness_budget}
                            error={error?.readiness_budget}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                        <TextArea
                            label={strings.eapFullFormFinanceDescriptionLabel}
                            name="readiness_cost_description"
                            value={value?.readiness_cost_description}
                            error={error?.readiness_cost_description}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormPrePositioningTitle}
                        description={(
                            <ul>
                                <li>{strings.eapFullFormPrePositioningDescription1}</li>
                                <li>{strings.eapFullFormPrePositioningDescription2}</li>
                                <li>{strings.eapFullFormPrePositioningDescription3}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <NumberInput
                            label={strings.eapFullFormPrePositioningBudgetLabel}
                            name="pre_positioning_budget"
                            value={value?.pre_positioning_budget}
                            error={error?.pre_positioning_budget}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                        <TextArea
                            label={strings.eapFullFormFinanceDescriptionLabel}
                            name="prepositioning_cost_description"
                            value={value?.prepositioning_cost_description}
                            error={error?.prepositioning_cost_description}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormEarlyActionCostTitle}
                        description={(
                            <ul>
                                <li>{strings.eapFullFormEarlyActionCostDescription1}</li>
                                <li>{strings.eapFullFormEarlyActionCostDescription2}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <NumberInput
                            label={strings.eapFullFormEarlyActionBudgetLabel}
                            name="early_action_budget"
                            value={value?.early_action_budget}
                            error={error?.early_action_budget}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                        <TextArea
                            label={strings.eapFullFormFinanceDescriptionLabel}
                            name="early_action_cost_description"
                            value={value?.early_action_cost_description}
                            error={error?.early_action_cost_description}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormEapEndorsementTitle}
                        description={strings.eapFullFormEapEndorsementDescription}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.eapFullFormFinanceDescriptionLabel}
                            name="eap_endorsement"
                            value={value?.eap_endorsement}
                            error={error?.eap_endorsement}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default FinanceLogistics;
