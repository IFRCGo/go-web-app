import {
    useCallback,
    useMemo,
} from 'react';
import {
    Button,
    Container,
    InputSection,
    MultiSelectInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import { listToMap } from '@togglecorp/fujs';
import {
    createSubmitHandler,
    type PartialForm,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import Page from '#components/Page';
import { type components } from '#generated/types';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';

import ERUTypeInput from './ERUTypeInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface ERUType {
    eruTypeId: string;
    equipment_readiness: number;
    people_readiness: number;
    funding_readiness: number;
    comments: string | undefined;
    comments_text: string;
}

interface ERUTypeFormInput {
    id: number;
    eruTypes: ERUType[] | undefined;
    eruNationalSociety: string;
}
type DeploymentsEruTypeEnum = components<'read'>['schemas']['DeploymentsEruTypeEnum'];

type ERUTypeFormFields = NonNullable<PartialForm<ERUTypeFormInput['eruTypes']>>[number];

function eruTypeKeySelector(item: DeploymentsEruTypeEnum) {
    return item.key;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const {
        deployments_eru_type,
    } = useGlobalEnums();

    const defaultValue = useMemo(() => ({
        // TODO: Add eruType NS
        national_society: 1,
        eruTypes: [],
    }), []);

    const {
        value,
        setFieldValue,
        validate,
        setError,
    } = useForm({}, { value: defaultValue });

    const strings = useTranslation(i18n);

    const eruTypesTitleDisplayMap = useMemo(
        () => (
            listToMap(
                deployments_eru_type,
                (eruType) => eruType.key,
                (eruType) => eruType.value,
            )
        ),
        [deployments_eru_type],
    );

    const {
        setValue: onEruTypeChange,
    } = useFormArray<'eruTypes', ERUTypeFormFields>(
        'eruTypes',
        setFieldValue,
    );

    const handleSubmit = useCallback(() => {
        const formData = {
            eruType: value.eruTypes,
        };
        // TODO: Remove console
        console.log('Form Submitted:', formData);
    }, [value]);

    const handleCancel = useCallback(() => {
        // TODO: Reset Value
    }, []);

    return (
        <Page
            className={styles.updateForm}
            title={strings.eruReadinessFormTitle}
            heading={strings.eruReadinessFormHeading}
            description={strings.eruReadinessFormDescription}
            withBackgroundColorInMainSection
            mainSectionClassName={styles.content}
            actions={(
                <>
                    <Button
                        name={undefined}
                        onClick={handleCancel}
                        variant="tertiary"
                    >
                        {strings.eruCancelButton}
                    </Button>
                    <Button
                        name={undefined}
                        onClick={createSubmitHandler(
                            validate,
                            setError,
                            handleSubmit,
                        )}
                        variant="secondary"
                    >
                        {strings.eruSaveAndCloseButton}
                    </Button>
                </>
            )}
        >
            <Container>
                <InputSection
                    title={strings.eruNationalSociety}
                    withAsteriskOnTitle
                >
                    {/* TODO: Remove NSSelectInput and add ERU Type NSSelectInput */}
                    <NationalSocietySelectInput
                        name="national_society"
                        onChange={() => {}}
                        value={value.national_society}
                    />
                </InputSection>
            </Container>
            <Container>
                <InputSection
                    title={strings.eruTypes}
                >
                    <MultiSelectInput
                        name="eruTypes"
                        options={deployments_eru_type}
                        value={value.eruTypes}
                        keySelector={eruTypeKeySelector}
                        labelSelector={stringValueSelector}
                        onChange={setFieldValue}
                    />
                </InputSection>
            </Container>
            <div className={styles.eruTypeList}>
                {value.eruTypes?.map((type, index) => (
                    <ERUTypeInput
                        index={index}
                        value={type}
                        onChange={onEruTypeChange}
                        titleDisplayMap={eruTypesTitleDisplayMap?.[type]}
                    />
                ))}
            </div>
        </Page>
    );
}

Component.displayName = 'ERUReadinessForm';
