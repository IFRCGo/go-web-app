import {
    useCallback,
    useMemo,
} from 'react';
import { CheckboxMultipleBlankFillIcon } from '@ifrc-go/icons';
import {
    Button,
    Checklist,
    Heading,
    InlineLayout,
    InputSection,
    ListView,
    Modal,
    TextOutput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import { listToMap } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import TabPage from '#components/TabPage';
import { type components } from '#generated/types';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';

import { type PartialSimplifiedEapType } from '../schema';
import ApproachesInput from './ApproachesInput';

import i18n from './i18n.json';

type EapApproach = components['schemas']['EapApproachEnumKey'];
type EapApproachOption = components['schemas']['EapApproachEnum'];

type EnablingApproachesFormFields = NonNullable<PartialSimplifiedEapType['enabling_approaches']>[number];

interface Props {
    value: PartialSimplifiedEapType;
    error: Error<PartialSimplifiedEapType> | undefined;
    disabled?: boolean;
    setFieldValue: (...entries: EntriesAsList<PartialSimplifiedEapType>) => void;
    readOnly?: boolean;
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

    const [
        showQualityCriteria,
        {
            setTrue: setShowQualityCriteriaTrue,
            setFalse: setShowQualityCriteriaFalse,
        },
    ] = useBooleanState(false);

    const {
        setValue: onApproachChange,
        removeValue: onApproachRemove,
    } = useFormArray<'enabling_approaches', EnablingApproachesFormFields>(
        'enabling_approaches',
        setFieldValue,
    );

    const handleApproachChecklistChange = useCallback((approaches: EapApproach[] | undefined) => {
        setFieldValue((previousValue: EnablingApproachesFormFields[] | undefined) => {
            const previousValueMapping = listToMap(
                previousValue,
                ({ approach }) => approach,
            );

            return approaches?.map((approach) => {
                const prevapproachValue = previousValueMapping?.[approach];

                if (prevapproachValue) {
                    return prevapproachValue;
                }

                return {
                    approach,
                } satisfies EnablingApproachesFormFields;
            });
        }, 'enabling_approaches');
    }, [setFieldValue]);

    const selectedApproaches = value?.enabling_approaches?.map(({ approach }) => approach);

    return (
        <TabPage spacingOffset={-6}>
            <InlineLayout
                after={(
                    <Button
                        name={undefined}
                        onClick={setShowQualityCriteriaTrue}
                        after={(<CheckboxMultipleBlankFillIcon />)}
                    >
                        {strings.enablingSectionCriteriaButtonLabel}
                    </Button>
                )}
            />
            <ListView
                layout="block"
                spacing="sm"
            >
                <Heading variant="form">
                    {strings.enablingApproachesTitle}
                </Heading>
                <InputSection
                    title={strings.enablingApproachesTitle}
                    description={strings.enablingApproachesDescription}
                    tooltip={strings.enablingApproachesTooltip}
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
                        onRemove={onApproachRemove}
                        error={getErrorObject(error?.enabling_approaches)}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                ))}
            </ListView>
            {showQualityCriteria && (
                <Modal
                    onClose={setShowQualityCriteriaFalse}
                    heading={strings.enablingSectionHeading}
                >
                    <ListView layout="block">
                        <Heading level={5}>
                            {strings.eapEnablingSectionHeading}
                        </Heading>
                        <TextOutput
                            label={strings.enablingSectionCriteriaIntroduction1}
                            value={(
                                <ul>
                                    <li>{strings.enablingSectionCriteriaComment11}</li>
                                    <li>{strings.enablingSectionCriteriaComment12}</li>
                                </ul>
                            )}
                            strongLabel
                            withoutLabelColon
                        />
                        <TextOutput
                            label={strings.enablingSectionCriteriaIntroduction2}
                            value={(
                                <ul>
                                    <li>{strings.enablingSectionCriteriaComment21}</li>
                                    <li>{strings.enablingSectionCriteriaComment22}</li>
                                    <li>{strings.enablingSectionCriteriaComment23}</li>
                                </ul>
                            )}
                            strongLabel
                            withoutLabelColon
                        />
                        <Heading level={5}>
                            {strings.enablingMonitoringSectionCriteriaHeading}
                        </Heading>
                        <TextOutput
                            label={strings.enablingSectionCriteriaIntroduction3}
                            value={(
                                <ul>
                                    <li>{strings.enablingSectionCriteriaComment31}</li>
                                    <li>{strings.enablingSectionCriteriaComment32}</li>
                                </ul>
                            )}
                            strongLabel
                            withoutLabelColon
                        />
                    </ListView>
                </Modal>
            )}
        </TabPage>
    );
}

export default EnablingApproaches;
