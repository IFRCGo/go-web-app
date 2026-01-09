import { DownloadLineIcon } from '@ifrc-go/icons';
import {
    Heading,
    InputSection,
    ListView,
    NumberInput,
    TextArea,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import Link from '#components/Link';
import TabPage from '#components/TabPage';
import { useRequest } from '#utils/restRequest';

import { type PartialEapFullFormType } from '../schema';

import i18n from './i18n.json';

interface Props {
    value: PartialEapFullFormType;
    setFieldValue: (...entries: EntriesAsList<PartialEapFullFormType>) => void;
    error: Error<PartialEapFullFormType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<
        React.SetStateAction<Record<number, string>>
    >;
    readOnly?: boolean;
}

function FinanceLogistics(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        readOnly,
    } = props;

    const error = getErrorObject(formError);
    const strings = useTranslation(i18n);

    const { response: templateUrl } = useRequest({
        url: '/api/v2/eap/global-files/{template_type}/',
        pathVariables: {
            template_type: 'budget_template',
        },
    });

    return (
        <TabPage>
            <ListView layout="block">
                <Heading level={4}>{strings.financeHeading}</Heading>
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
                        readOnly={readOnly}
                    />
                    <TextArea
                        label={strings.financeDescriptionLabel}
                        name="budget_description"
                        value={value?.budget_description}
                        error={error?.budget_description}
                        onChange={setFieldValue}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                </InputSection>
                <InputSection
                    description={(
                        <Link
                            external
                            href={templateUrl?.url}
                            styleVariant="action"
                            withUnderline
                        >
                            {strings.financeDownloadDescription}
                            <DownloadLineIcon />
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
                        onChange={setFieldValue}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                    <TextArea
                        label={strings.financeDescriptionLabel}
                        name="readiness_cost_description"
                        value={value?.readiness_cost_description}
                        error={error?.readiness_cost_description}
                        onChange={setFieldValue}
                        disabled={disabled}
                        readOnly={readOnly}
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
                        onChange={setFieldValue}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                    <TextArea
                        label={strings.financeDescriptionLabel}
                        name="prepositioning_cost_description"
                        value={value?.prepositioning_cost_description}
                        error={error?.prepositioning_cost_description}
                        onChange={setFieldValue}
                        disabled={disabled}
                        readOnly={readOnly}
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
                        onChange={setFieldValue}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                    <TextArea
                        label={strings.financeDescriptionLabel}
                        name="early_action_cost_description"
                        value={value?.early_action_cost_description}
                        error={error?.early_action_cost_description}
                        onChange={setFieldValue}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                </InputSection>
                <Heading level={4}>{strings.financeEapEndorsementHeading}</Heading>
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
                    />
                </InputSection>
            </ListView>
        </TabPage>
    );
}

export default FinanceLogistics;
