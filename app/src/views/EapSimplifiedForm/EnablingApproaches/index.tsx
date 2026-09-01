import {
    useCallback,
    useMemo,
} from 'react';
import {
    Checklist,
    ConfirmModal,
    Container,
    Description,
    Heading,
    InputSection,
    Label,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';

import ExplanatoryNote from '#components/ExplanatoryNote';
import NonFieldError from '#components/NonFieldError';
import TabPage from '#components/TabPage';
import { type components } from '#generated/types';
import useChecklistFormArray from '#hooks/domain/useChecklistFormArray';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { type GoApiResponse } from '#utils/restRequest';

import GuidanceSeap from '../GuidanceSeap';
import { type PartialSimplifiedEapType } from '../schema';
import ApproachesInput from './ApproachesInput';

import i18n from './i18n.json';

type EapApproach = components['schemas']['EapApproachEnumKey'];
type EapApproachOption = components['schemas']['EapApproachEnum'];

type EnablingApproachesFormFields = NonNullable<PartialSimplifiedEapType['enabling_approaches']>[number];
type EapApproachApCodeOption = NonNullable<GoApiResponse<'/api/v2/eap/options/'>['approach_ap_codes']>;

function approachSelector(approach: EnablingApproachesFormFields) {
    return approach.approach;
}

function createApproach(approach: EapApproach) {
    return { approach } satisfies EnablingApproachesFormFields;
}

interface Props {
    value: PartialSimplifiedEapType;
    error: Error<PartialSimplifiedEapType> | undefined;
    disabled?: boolean;
    setFieldValue: (...entries: EntriesAsList<PartialSimplifiedEapType>) => void;
    readOnly?: boolean;
    approachApCodeOption?: EapApproachApCodeOption;
}

function approachesKeySelector(option: EapApproachOption) {
    return option.key;
}

function EnablingApproaches(props: Props) {
    const {
        value,
        error: formError,
        disabled,
        setFieldValue,
        readOnly,
        approachApCodeOption,
    } = props;

    const error = getErrorObject(formError);
    const strings = useTranslation(i18n);

    const { eap_approach: eapApproachOptions } = useGlobalEnums();

    const eapApproachLabelMapping = useMemo(() => (
        listToMap(
            eapApproachOptions,
            ({ key }) => key,
            ({ value: label }) => label,
        )
    ), [eapApproachOptions]);

    const {
        setValue: onApproachChange,
        removeValue: onApproachRemove,
    } = useFormArray<'enabling_approaches', EnablingApproachesFormFields>(
        'enabling_approaches',
        setFieldValue,
    );

    const setEnablingApproaches = useCallback((getNewValue: (
        previousValue: EnablingApproachesFormFields[] | undefined,
    ) => EnablingApproachesFormFields[] | undefined) => {
        setFieldValue(getNewValue, 'enabling_approaches');
    }, [setFieldValue]);

    const {
        selectedKeys: selectedApproaches,
        pendingRemoval: pendingApproachRemoval,
        handleChecklistChange: handleApproachChecklistChange,
        handleRemoveClick: handleApproachRemoveClick,
        handleRemovalCancel: handleApproachRemovalCancel,
        handleRemovalConfirm: handleApproachRemovalConfirm,
    } = useChecklistFormArray({
        value: value?.enabling_approaches,
        keySelector: approachSelector,
        createItem: createApproach,
        setValue: setEnablingApproaches,
        removeValue: onApproachRemove,
    });

    return (
        <TabPage
            headerAction={(
                <GuidanceSeap
                    heading={strings.enablingSectionHeading}
                    content={(
                        <ListView layout="block" withSpacingOpticalCorrection>
                            <Heading level={5}>
                                {strings.eapEnablingSectionHeading}
                            </Heading>
                            <Label strong>
                                {strings.enablingSectionCriteriaIntroduction1}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.enablingSectionCriteriaComment11}
                                </Description>
                                <Description>
                                    {strings.enablingSectionCriteriaComment12}
                                </Description>
                                <Description>
                                    {strings.enablingSectionCriteriaComment13}
                                </Description>
                            </ListView>
                            <Label strong>
                                {strings.enablingSectionCriteriaIntroduction2}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.enablingSectionCriteriaComment21}
                                </Description>
                                <Description>
                                    {strings.enablingSectionCriteriaComment22}
                                </Description>
                                <Description>
                                    {strings.enablingSectionCriteriaComment23}
                                </Description>
                                <Description>
                                    {strings.enablingSectionCriteriaComment24}
                                </Description>
                            </ListView>
                            <Heading level={5}>
                                {strings.enablingMonitoringSectionCriteriaHeading}
                            </Heading>
                            <Label strong>
                                {strings.enablingSectionCriteriaIntroduction3}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.enablingSectionCriteriaComment31}
                                </Description>
                                <Description>
                                    {strings.enablingSectionCriteriaComment32}
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                />
            )}
        >
            <Container
                heading={strings.enablingApproachesTitle}
                variant="form"
            >
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.enablingApproachesTitle}
                        description={strings.enablingApproachesDescription}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.enablingApproachesTitle}
                                ariaLabel={strings.enablingApproachesTitle}
                                title={strings.enablingApproachesTitle}
                                content={(
                                    <Description>
                                        {strings.enablingApproachesTooltip}
                                    </Description>
                                )}
                            />
                        )}
                        withAsteriskOnTitle
                    >
                        <NonFieldError error={getErrorObject(error?.enabling_approaches)} />
                        <Checklist
                            name={undefined}
                            options={eapApproachOptions}
                            onChange={handleApproachChecklistChange}
                            value={selectedApproaches}
                            disabled={disabled}
                            keySelector={approachesKeySelector}
                            labelSelector={stringValueSelector}
                            checkListLayout="grid"
                            checkListLayoutPreferredGridColumns={3}
                            readOnly={readOnly}
                        />
                    </InputSection>
                    {value?.enabling_approaches?.map((approach, index) => (
                        <ApproachesInput
                            approachTitle={eapApproachLabelMapping?.[approach.approach]}
                            key={approach.approach}
                            index={index}
                            value={approach}
                            onChange={onApproachChange}
                            onRemove={handleApproachRemoveClick}
                            error={getErrorObject(error?.enabling_approaches)}
                            disabled={disabled}
                            readOnly={readOnly}
                            approachApCodeOption={approachApCodeOption}
                            leadTimeframeUnit={value?.seap_lead_timeframe_unit}
                        />
                    ))}
                </ListView>
            </Container>
            {isDefined(pendingApproachRemoval) && (
                <ConfirmModal
                    name={undefined}
                    message={pendingApproachRemoval.type === 'checklist'
                        ? strings.enablingApproachUnselectConfirmation
                        : strings.enablingApproachRemoveConfirmation}
                    onCancel={handleApproachRemovalCancel}
                    onConfirm={handleApproachRemovalConfirm}
                />
            )}
        </TabPage>
    );
}

export default EnablingApproaches;
