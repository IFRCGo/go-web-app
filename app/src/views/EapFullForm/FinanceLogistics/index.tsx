import { useCallback } from 'react';
import {
    Container,
    Description,
    InputSection,
    Label,
    ListView,
    NumberInput,
    TextArea,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { sumSafe } from '@ifrc-go/ui/utils';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
    type SetBaseValueArg,
} from '@togglecorp/toggle-form';

import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import Link from '#components/Link';
import TabPage from '#components/TabPage';
import { useRequest } from '#utils/restRequest';

import { type PartialEapFullFormType } from '../schema';
import SectionQualityCriteria from '../SectionQualityCriteria';

import i18n from './i18n.json';

interface Props {
    value: PartialEapFullFormType;
    setFieldValue: (...entries: EntriesAsList<PartialEapFullFormType>) => void;
    setValue: (value: SetBaseValueArg<PartialEapFullFormType>) => void;
    error: Error<PartialEapFullFormType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<
        React.SetStateAction<Record<number, string>>
    >;
    readOnly?: boolean;
    isRevision?: boolean;
}

function FinanceLogistics(props: Props) {
    const {
        value,
        setFieldValue,
        setValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        readOnly,
        isRevision,
    } = props;

    const error = getErrorObject(formError);
    const strings = useTranslation(i18n);

    const { response: templateUrl } = useRequest({
        url: '/api/v2/eap/global-files/{template_type}/',
        pathVariables: {
            template_type: 'budget_template',
        },
    });

    const setBudgetValue = useCallback(
        (
            budgetValue: number | undefined,
            name:
                | 'readiness_budget'
                | 'pre_positioning_budget'
                | 'early_action_budget',
        ) => {
            setValue((prevValue) => {
                const newBudgetValue = {
                    readiness_budget: prevValue.readiness_budget,
                    pre_positioning_budget: prevValue.pre_positioning_budget,
                    early_action_budget: prevValue.early_action_budget,
                    [name]: budgetValue,
                };

                return {
                    ...prevValue,
                    [name]: budgetValue,
                    total_budget: sumSafe([
                        newBudgetValue.readiness_budget,
                        newBudgetValue.pre_positioning_budget,
                        newBudgetValue.early_action_budget,
                    ]),
                };
            });
        },
        [setValue],
    );

    return (
        <TabPage
            spacingOffset={-6}
            headerAction={(
                <SectionQualityCriteria
                    heading={strings.financeSectionHeading}
                    content={(
                        <ListView layout="block" withSpacingOpticalCorrection>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Label strong>
                                    {strings.financeCriteriaIntroduction11}
                                </Label>
                                <Label>
                                    {strings.financeCriteriaIntroduction12}
                                </Label>
                            </ListView>
                            <Description>
                                {strings.financeCriteriaComment1}
                            </Description>
                            <Label strong>
                                {strings.financeCriteriaIntroduction2}
                            </Label>
                            <Description>
                                {strings.financeCriteriaComment2}
                            </Description>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Label strong>
                                    {strings.financeCriteriaIntroduction31}
                                </Label>
                                <Label>
                                    {strings.financeCriteriaIntroduction32}
                                </Label>
                            </ListView>
                            <Description>
                                {strings.financeCriteriaComment3}
                            </Description>
                        </ListView>
                    )}
                />
            )}
        >
            <Container
                heading={strings.financeHeading}
                variant="form"
            >
                <ListView layout="block" spacing="sm">
                    <InputSection
                        title={strings.financeBudgetTitle}
                        tooltip={(
                            <TextOutput
                                strongLabel
                                label={strings.financeExplanatoryNoteLabel}
                                value={strings.financeExplanatoryNote}
                            />
                        )}
                        description={(
                            <ul>
                                <li>{strings.financeBudgetDescription1}</li>
                                <li>{strings.financeBudgetDescription2}</li>
                                <li>{strings.financeBudgetDescription3}</li>
                                <li>{strings.financeBudgetDescription4}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <NumberInput
                            label={strings.financeTotalBudgetLabel}
                            name="total_budget"
                            value={value.total_budget}
                            error={error?.total_budget}
                            onChange={setFieldValue}
                            disabled={disabled}
                            readOnly
                            required
                        />
                        <TextArea
                            label={strings.financeDescriptionLabel}
                            name="budget_description"
                            value={value?.budget_description}
                            error={error?.budget_description}
                            onChange={setFieldValue}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={500}
                        />
                    </InputSection>
                    <InputSection
                        description={(
                            <Link external href={templateUrl?.url} withUnderline withLinkIcon>
                                {strings.financeDownloadDescription}
                            </Link>
                        )}
                    >
                        <GoSingleFileInput
                            name="budget_file"
                            accept=".xlsx, .xlsm"
                            fileIdToUrlMap={fileIdToUrlMap}
                            onChange={setFieldValue}
                            url="/api/v2/eap-file/"
                            value={value?.budget_file}
                            error={getErrorString(error?.budget_file)}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            required
                            clearable
                            disabled={disabled}
                            readOnly={readOnly}
                            useCurrentLanguageForMutation
                            label={strings.financeUploadBudgetLabel}
                        >
                            {strings.financeUploadButtonLabel}
                        </GoSingleFileInput>
                    </InputSection>
                    <InputSection
                        title={strings.financeReadinessCostTitle}
                        tooltip={(
                            <ListView layout="block">
                                <TextOutput
                                    strongLabel
                                    label={strings.financeExplanatoryNoteLabel}
                                    value={strings.financeReadinessCostExplanatoryNote}
                                />
                                <TextOutput
                                    strongLabel
                                    label={strings.financeRequiredPointsLabel}
                                    value={(
                                        <ul>
                                            <li>{strings.financeReadinessCostDescription1}</li>
                                            <li>{strings.financeReadinessCostDescription2}</li>
                                        </ul>
                                    )}
                                />
                            </ListView>
                        )}
                        description={(
                            <ul>
                                <li>{strings.financeReadinessCostDescription1}</li>
                                <li>{strings.financeReadinessCostDescription2}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <NumberInput
                            label={strings.financeReadinessBudgetLabel}
                            name="readiness_budget"
                            value={value?.readiness_budget}
                            error={error?.readiness_budget}
                            onChange={setBudgetValue}
                            disabled={disabled}
                            readOnly={readOnly}
                            required
                        />
                        <TextArea
                            label={strings.financeDescriptionLabel}
                            name="readiness_cost_description"
                            value={value?.readiness_cost_description}
                            error={error?.readiness_cost_description}
                            onChange={setFieldValue}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={500}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.financePrePositioningTitle}
                        tooltip={(
                            <ListView layout="block">
                                <TextOutput
                                    strongLabel
                                    label={strings.financeExplanatoryNoteLabel}
                                    value={strings.financePrePositioningExplanatoryNote}
                                />
                                <TextOutput
                                    strongLabel
                                    label={strings.financeRequiredPointsLabel}
                                    value={(
                                        <ul>
                                            <li>{strings.financePrePositioningDescription1}</li>
                                            <li>{strings.financePrePositioningDescription2}</li>
                                            <li>{strings.financePrePositioningDescription3}</li>
                                        </ul>
                                    )}
                                />
                            </ListView>
                        )}
                        description={(
                            <ul>
                                <li>{strings.financePrePositioningDescription1}</li>
                                <li>{strings.financePrePositioningDescription2}</li>
                                <li>{strings.financePrePositioningDescription3}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <NumberInput
                            label={strings.financePrePositioningBudgetLabel}
                            name="pre_positioning_budget"
                            value={value?.pre_positioning_budget}
                            error={error?.pre_positioning_budget}
                            onChange={setBudgetValue}
                            disabled={disabled}
                            readOnly={readOnly}
                            required
                        />
                        <TextArea
                            label={strings.financeDescriptionLabel}
                            name="prepositioning_cost_description"
                            value={value?.prepositioning_cost_description}
                            error={error?.prepositioning_cost_description}
                            onChange={setFieldValue}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={500}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.financeEarlyActionCostTitle}
                        tooltip={(
                            <ListView layout="block">
                                <TextOutput
                                    strongLabel
                                    label={strings.financeExplanatoryNoteLabel}
                                    value={strings.financeEarlyActionCostExplanatoryNote}
                                />
                                <TextOutput
                                    strongLabel
                                    label={strings.financeRequiredPointsLabel}
                                    value={(
                                        <ul>
                                            <li>{strings.financeEarlyActionCostDescription1}</li>
                                            <li>{strings.financeEarlyActionCostDescription2}</li>
                                            <li>{strings.financeEarlyActionCostDescription3}</li>
                                            <li>{strings.financeEarlyActionCostDescription4}</li>
                                        </ul>
                                    )}
                                />
                            </ListView>
                        )}
                        description={(
                            <ul>
                                <li>{strings.financeEarlyActionCostDescription1}</li>
                                <li>{strings.financeEarlyActionCostDescription2}</li>
                                <li>{strings.financeEarlyActionCostDescription3}</li>
                                <li>{strings.financeEarlyActionCostDescription4}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <NumberInput
                            label={strings.financeEarlyActionBudgetLabel}
                            name="early_action_budget"
                            value={value?.early_action_budget}
                            error={error?.early_action_budget}
                            onChange={setBudgetValue}
                            disabled={disabled}
                            readOnly={readOnly}
                            required
                        />
                        <TextArea
                            label={strings.financeDescriptionLabel}
                            name="early_action_cost_description"
                            value={value?.early_action_cost_description}
                            error={error?.early_action_cost_description}
                            onChange={setFieldValue}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={500}
                        />
                    </InputSection>
                </ListView>
            </Container>
            <Container
                heading={strings.financeEapEndorsementHeading}
                variant="form"
            >
                <ListView layout="block" spacing="sm">
                    <InputSection
                        title={strings.financeEapEndorsementTitle}
                        tooltip={(
                            <TextOutput
                                strongLabel
                                label={strings.financeExplanatoryNoteLabel}
                                value={strings.financeEapEndorsementExplanatoryNote}
                            />
                        )}
                        description={strings.financeEapEndorsementDescription}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.financeDescriptionLabel}
                            name="eap_endorsement"
                            value={value?.eap_endorsement}
                            error={error?.eap_endorsement}
                            onChange={setFieldValue}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={300}
                        />
                    </InputSection>
                </ListView>
            </Container>
            {isRevision && (
                <InputSection title={strings.updatedChecklistTitle}>
                    <GoSingleFileInput
                        name="updated_checklist_file"
                        url="/api/v2/eap-file/"
                        value={value?.updated_checklist_file}
                        accept=".pdf, .docx, .pptx, .xlsx, .xlsm"
                        onChange={setFieldValue}
                        error={getErrorString(error?.updated_checklist_file)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        disabled={disabled}
                        readOnly={readOnly}
                        clearable
                    >
                        {strings.financeUploadButtonLabel}
                    </GoSingleFileInput>
                </InputSection>
            )}
        </TabPage>
    );
}

export default FinanceLogistics;
