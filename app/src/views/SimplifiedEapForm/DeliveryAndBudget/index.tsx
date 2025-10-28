import {
    Container,
    Heading,
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
        <Container
            heading={strings.simplifiedEapDeliverHeading}
        >
            <ListView
                layout="block"
                spacing="sm"
            >
                <InputSection
                    title={strings.simplifiedEapDeliverEarlyActions}
                    description={strings.simplifiedEapDeliverEarlyActionsDescription}
                    withAsteriskOnTitle
                >
                    <TextArea
                        label={strings.simplifiedEapDeliverDescription}
                        name="early_action_capability"
                        value={value?.early_action_capability}
                        onChange={setFieldValue}
                        error={error?.early_action_capability}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.simplifiedEapDeliverInvolved}
                    description={strings.simplifiedEapDeliverInvolvedDescription}
                    withAsteriskOnTitle
                >
                    <TextArea
                        label={strings.simplifiedEapDeliverDescription}
                        name="rcrc_movement_involvement"
                        value={value?.rcrc_movement_involvement}
                        onChange={setFieldValue}
                        error={error?.rcrc_movement_involvement}
                        disabled={disabled}
                    />
                </InputSection>
                <Heading level={4}>
                    {strings.simplifiedEapDeliverBudget}
                </Heading>
                <InputSection
                    title={strings.simplifiedEapDeliverTotalBudget}
                    description={strings.simplifiedEapDeliverTotalBudgetDescription}
                    withAsteriskOnTitle
                >
                    <ListView layout="block">
                        <ListView
                            layout="grid"
                            numPreferredGridColumns={2}
                        >
                            <NumberInput
                                name="total_budget"
                                value={value?.total_budget}
                                onChange={setFieldValue}
                                error={error?.total_budget}
                                disabled={disabled}
                                label={strings.simplifiedEapDeliverBudgetLabel}
                            />
                            <NumberInput
                                label={strings.simplifiedEapDeliverReadinessLabel}
                                name="readiness_budget"
                                value={value?.readiness_budget}
                                onChange={setFieldValue}
                                error={error?.readiness_budget}
                                disabled={disabled}
                            />
                            <NumberInput
                                label={strings.simplifiedEapDeliverPrepositioning}
                                name="pre_positioning_budget"
                                value={value?.pre_positioning_budget}
                                onChange={setFieldValue}
                                error={error?.pre_positioning_budget}
                                disabled={disabled}
                            />
                            <NumberInput
                                label={strings.simplifiedEapEarlyAction}
                                name="early_action_budget"
                                value={value?.early_action_budget}
                                onChange={setFieldValue}
                                error={error?.early_action_budget}
                                disabled={disabled}
                            />
                        </ListView>
                    </ListView>
                </InputSection>
                <InputSection
                    title={strings.simplifiedEapDeliverBudgetDetails}
                    description={strings.simplifiedEapDeliverBudgetDetailsDescription}
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
                        {strings.simplifiedEapUpload}
                    </GoSingleFileInput>
                </InputSection>
            </ListView>
        </Container>
    );
}

export default DeliveryAndBudget;
