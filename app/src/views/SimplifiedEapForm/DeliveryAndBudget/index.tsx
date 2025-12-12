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

function DeliveryAndBudget(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);

    return (
        <TabPage>
            <Container heading={strings.deliverHeading}>
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.deliverEarlyActions}
                        description={strings.deliverEarlyActionsDescription}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.deliverDescription}
                            name="early_action_capability"
                            value={value?.early_action_capability}
                            onChange={setFieldValue}
                            error={error?.early_action_capability}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.deliverInvolved}
                        description={strings.deliverInvolvedDescription}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.deliverDescription}
                            name="rcrc_movement_involvement"
                            value={value?.rcrc_movement_involvement}
                            onChange={setFieldValue}
                            error={error?.rcrc_movement_involvement}
                            disabled={disabled}
                        />
                    </InputSection>
                </ListView>
            </Container>
            <Container heading={strings.budgetHeading}>
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.deliverTotalBudget}
                        description={strings.deliverTotalBudgetDescription}
                        withAsteriskOnTitle
                    >
                        <ListView
                            layout="grid"
                            numPreferredGridColumns={4}
                        >
                            <NumberInput
                                // FIXME: total budget should be automatically calculated
                                name="total_budget"
                                value={value?.total_budget}
                                onChange={setFieldValue}
                                error={error?.total_budget}
                                disabled={disabled}
                                label={strings.deliverBudgetLabel}
                            />
                            <NumberInput
                                label={strings.deliverReadinessLabel}
                                name="readiness_budget"
                                value={value?.readiness_budget}
                                onChange={setFieldValue}
                                error={error?.readiness_budget}
                                disabled={disabled}
                            />
                            <NumberInput
                                label={strings.deliverPrepositioning}
                                name="pre_positioning_budget"
                                value={value?.pre_positioning_budget}
                                onChange={setFieldValue}
                                error={error?.pre_positioning_budget}
                                disabled={disabled}
                            />
                            <NumberInput
                                label={strings.earlyAction}
                                name="early_action_budget"
                                value={value?.early_action_budget}
                                onChange={setFieldValue}
                                error={error?.early_action_budget}
                                disabled={disabled}
                            />
                        </ListView>
                    </InputSection>
                    <InputSection
                        title={strings.deliverBudgetDetails}
                        description={strings.deliverBudgetDetailsDescription}
                        withAsteriskOnTitle
                    >
                        <GoSingleFileInput
                            name="budget_file"
                            url="/api/v2/eap-file/"
                            value={value?.budget_file}
                            onChange={setFieldValue}
                            error={getErrorString(error?.budget_file)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            disabled={disabled}
                        >
                            {strings.upload}
                        </GoSingleFileInput>
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default DeliveryAndBudget;
