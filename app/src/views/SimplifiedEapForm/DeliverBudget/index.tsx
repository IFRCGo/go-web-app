import {
    Container,
    Heading,
    InputSection,
    NumberInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import ImageWithCaptionInput from '#components/domain/ImageWithCaptionInput';

import { type PartialSimplifiedEapType } from '../schema';

import i18n from './i18n.json';

interface Props {
    value: PartialSimplifiedEapType;
    setFieldValue: (...entries: EntriesAsList<PartialSimplifiedEapType>) => void;
    error: Error<PartialSimplifiedEapType> | undefined;
    disabled?: boolean;
}

function Deliver(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);

    return (
        <Container
            heading={strings.simplifiedEapDeliverHeading}
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
                numPreferredColumns={4}
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
            </InputSection>
            <InputSection
                title={strings.simplifiedEapDeliverBudgetDetails}
                description={strings.simplifiedEapDeliverBudgetDetailsDescription}
                withAsteriskOnTitle
            >
                <ImageWithCaptionInput
                    name="cover_image"
                    url="/api/v2/eap-file/"
                    value={undefined}
                    onChange={() => {}}
                    error={undefined}
                    fileIdToUrlMap={[]}
                    setFileIdToUrlMap={undefined}
                    label="Upload"
                    disabled={disabled}
                />
            </InputSection>
        </Container>
    );
}

export default Deliver;
