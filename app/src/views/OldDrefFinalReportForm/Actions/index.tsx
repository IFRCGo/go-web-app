import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    BooleanInput,
    Button,
    Container,
    InputSection,
    SelectInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import {
    isNotDefined,
    listToMap,
    randomString,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { type GoApiResponse } from '#utils/restRequest';

import {
    TYPE_ASSESSMENT,
    TYPE_IMMINENT,
} from '../common';
import { type PartialFinalReport } from '../schema';
import NeedInput from './NeedInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type NeedOption = NonNullable<GlobalEnumsResponse['dref_identified_need_title']>[number];

type Value = PartialFinalReport;
type NeedFormFields = NonNullable<PartialFinalReport['needs_identified']>[number];

function needOptionKeySelector(option: NeedOption) {
    return option.key;
}

interface Props {
    value: Value;
    setFieldValue: (...entries: EntriesAsList<Value>) => void;
    error: Error<Value> | undefined;
    disabled?: boolean;
}

function Actions(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
    } = props;

    const [selectedNeed, setSelectedNeed] = useState<NeedOption['key'] | undefined>();

    const strings = useTranslation(i18n);

    const {
        dref_identified_need_title: needOptions,
    } = useGlobalEnums();

    const error = getErrorObject(formError);

    const {
        setValue: onNeedChange,
        removeValue: onNeedRemove,
    } = useFormArray<'needs_identified', NeedFormFields>(
        'needs_identified',
        setFieldValue,
    );

    const handleNeedAddButtonClick = useCallback((title: NeedOption['key'] | undefined) => {
        const newNeedItem: NeedFormFields = {
            client_id: randomString(),
            title,
        };

        setFieldValue(
            (oldValue: NeedFormFields[] | undefined) => (
                [...(oldValue ?? []), newNeedItem]
            ),
            'needs_identified' as const,
        );

        setSelectedNeed(undefined);
    }, [setFieldValue, setSelectedNeed]);

    const needsIdentifiedMap = useMemo(() => (
        listToMap(
            value.needs_identified,
            (d) => d.title ?? '<no-key>',
            () => true,
        )
    ), [value.needs_identified]);

    const filteredNeedOptions = useMemo(
        () => (
            needOptions?.filter(
                (n) => !needsIdentifiedMap?.[n.key],
            )
        ),
        [needsIdentifiedMap, needOptions],
    );

    const needsIdentifiedTitleDisplayMap = useMemo(
        () => (
            listToMap(
                needOptions,
                (need) => need.key,
                (need) => need.value,
            )
        ),
        [needOptions],
    );

    return (
        <div className={styles.actions}>
            <Container
                className={styles.nationalSocietyActions}
                heading={strings.finalReportNationalSocietiesActions}
                headerDescription={strings.drefFormNationalSocietiesActionsDescription}
            >
                <InputSection title={strings.finalReportHaveNationalSocietyConducted}>
                    <BooleanInput
                        name="has_national_society_conducted"
                        onChange={setFieldValue}
                        value={value?.has_national_society_conducted}
                        error={error?.has_national_society_conducted}
                        disabled={disabled}
                    />
                </InputSection>
                {value.has_national_society_conducted === true && (
                    <InputSection title={strings.finalReportDescriptionOfAdditionalActivities}>
                        <TextArea
                            name="national_society_conducted_description"
                            value={value.national_society_conducted_description}
                            onChange={setFieldValue}
                            error={error?.national_society_conducted_description}
                            disabled={disabled}
                        />
                    </InputSection>
                )}
            </Container>
            <Container
                heading={strings.ifrcNetworkActionsHeading}
            >
                <InputSection
                    title={strings.drefFormIfrc}
                    description={strings.drefFormIfrcDescription}
                >
                    <TextArea
                        label={strings.drefFormActionDescription}
                        name="ifrc"
                        onChange={setFieldValue}
                        value={value.ifrc}
                        error={error?.ifrc}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormPartnerNationalSociety}
                    description={strings.drefFormPartnerNationalSocietyDescription}
                >
                    <TextArea
                        name="partner_national_society"
                        onChange={setFieldValue}
                        value={value.partner_national_society}
                        error={error?.partner_national_society}
                        disabled={disabled}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.icrcActionsHeading}
            >
                <InputSection
                    title={strings.drefFormIcrc}
                    description={strings.drefFormIcrcDescription}
                >
                    <TextArea
                        label={strings.drefFormActionDescription}
                        name="icrc"
                        onChange={setFieldValue}
                        value={value.icrc}
                        error={error?.icrc}
                        disabled={disabled}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.drefFormNationalOtherActors}
                className={styles.otherActors}
            >
                <InputSection
                    title={strings.drefFormInternationalAssistance}
                >
                    <BooleanInput
                        name="government_requested_assistance"
                        value={value.government_requested_assistance}
                        onChange={setFieldValue}
                        error={error?.government_requested_assistance}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormNationalAuthorities}
                    description={strings.drefFormNationalAuthoritiesDescription}
                >
                    <TextArea
                        label={strings.drefFormActionDescription}
                        name="national_authorities"
                        onChange={setFieldValue}
                        value={value.national_authorities}
                        error={error?.national_authorities}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormUNorOtherActors}
                    description={strings.drefFormNationalAuthoritiesDescription}
                >
                    <TextArea
                        label={strings.drefFormActionDescription}
                        name="un_or_other_actor"
                        onChange={setFieldValue}
                        value={value.un_or_other_actor}
                        error={error?.un_or_other_actor}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormCoordinationMechanism}
                >
                    <BooleanInput
                        name="is_there_major_coordination_mechanism"
                        value={value.is_there_major_coordination_mechanism}
                        onChange={setFieldValue}
                        error={error?.is_there_major_coordination_mechanism}
                        disabled={disabled}
                    />
                </InputSection>
                {value.is_there_major_coordination_mechanism && (
                    <InputSection
                        description={strings.drefFormCoordinationMechanismDescription}
                    >
                        <TextArea
                            label={strings.drefFormActionDescription}
                            name="major_coordination_mechanism"
                            onChange={setFieldValue}
                            value={value.major_coordination_mechanism}
                            error={error?.major_coordination_mechanism}
                            disabled={disabled}
                        />
                    </InputSection>
                )}
            </Container>
            {/* NOTE: This condition was not there before */}
            {value?.type_of_dref !== TYPE_ASSESSMENT && (
                <Container
                    className={styles.needsIdentified}
                    heading={
                        value?.type_of_dref === TYPE_IMMINENT
                            ? strings.drefFormImminentNeedsIdentified
                            : strings.drefFormNeedsIdentified
                    }
                >
                    <InputSection>
                        <div className={styles.addNeedContainer}>
                            <SelectInput
                                className={styles.input}
                                label={strings.drefFormActionFieldsLabel}
                                name={undefined}
                                onChange={setSelectedNeed}
                                keySelector={needOptionKeySelector}
                                labelSelector={stringValueSelector}
                                options={filteredNeedOptions}
                                value={selectedNeed}
                                disabled={disabled}
                            />
                            <Button
                                className={styles.action}
                                variant="secondary"
                                name={selectedNeed}
                                onClick={handleNeedAddButtonClick}
                                disabled={isNotDefined(selectedNeed) || disabled}
                            >
                                {strings.drefFormAddButton}
                            </Button>
                        </div>
                    </InputSection>
                    <NonFieldError error={getErrorObject(error?.needs_identified)} />
                    {value?.needs_identified?.map((need, i) => (
                        <NeedInput
                            key={need.client_id}
                            index={i}
                            value={need}
                            onChange={onNeedChange}
                            onRemove={onNeedRemove}
                            error={getErrorObject(error?.needs_identified)}
                            titleDisplayMap={needsIdentifiedTitleDisplayMap}
                            disabled={disabled}
                        />
                    ))}
                </Container>
            )}
        </div>
    );
}

export default Actions;
