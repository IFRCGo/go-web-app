import { useMemo } from 'react';
import {
    InputSection,
    ListView,
    RadioInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import { randomString } from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialEruItem } from '../schema';

import i18n from './i18n.json';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;

type ReadinessOption = NonNullable<GlobalEnumsResponse['deployments_eru_readiness_status']>[number];
type ContributionOption = NonNullable<GlobalEnumsResponse['deployments_eru_readiness_ns_contribution']>[number];

function readinessKeySelector(option: ReadinessOption) {
    return option.key;
}
function contributionKeySelector(option: ContributionOption) {
    return option.key;
}

const defaultCollectionValue: PartialEruItem = {
    client_id: randomString(),
};

interface Props {
    index: number;
    value: PartialEruItem;
    onChange: (value: SetValueArg<PartialEruItem>, index: number) => void;
    error: ArrayError<PartialEruItem> | undefined;
}

function EruInputItem(props: Props) {
    const {
        index,
        value,
        onChange,
        error: errorFromProps,
    } = props;

    const strings = useTranslation(i18n);

    const {
        deployments_eru_type: eruTypeOptions,
        deployments_eru_readiness_status,
        deployments_eru_readiness_ns_contribution: nsContributionOptions,
    } = useGlobalEnums();

    const onFieldChange = useFormObject(
        index,
        onChange,
        defaultCollectionValue,
    );

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    const title = useMemo(() => (
        eruTypeOptions?.find((eruType) => eruType.key === value.type)?.value
    ), [eruTypeOptions, value.type]);

    return (
        <InputSection
            title={title}
            numPreferredColumns={2}
            withFullWidthContent
        >
            <ListView>
                <RadioInput
                    label={strings.eruEquipmentReadiness}
                    name="equipment_readiness"
                    value={value.equipment_readiness}
                    onChange={onFieldChange}
                    options={deployments_eru_readiness_status}
                    keySelector={readinessKeySelector}
                    labelSelector={stringValueSelector}
                    error={error?.equipment_readiness}
                    radioListLayout="block"
                />
                <RadioInput
                    label={strings.eruPeopleReadiness}
                    name="people_readiness"
                    value={value.people_readiness}
                    onChange={onFieldChange}
                    options={deployments_eru_readiness_status}
                    keySelector={readinessKeySelector}
                    labelSelector={stringValueSelector}
                    error={error?.people_readiness}
                    radioListLayout="block"
                />
                <RadioInput
                    label={strings.eruFundingReadiness}
                    name="funding_readiness"
                    value={value.funding_readiness}
                    onChange={onFieldChange}
                    options={deployments_eru_readiness_status}
                    keySelector={readinessKeySelector}
                    labelSelector={stringValueSelector}
                    error={error?.funding_readiness}
                    radioListLayout="block"
                />
            </ListView>
            <ListView
                layout="block"
            >
                <TextArea
                    label={strings.eruComments}
                    name="comment"
                    value={value?.comment}
                    onChange={onFieldChange}
                    error={error?.comment}
                />
                <RadioInput
                    name="ns_contribution"
                    value={value?.ns_contribution}
                    onChange={onFieldChange}
                    options={nsContributionOptions}
                    keySelector={contributionKeySelector}
                    labelSelector={stringValueSelector}
                    error={error?.ns_contribution}
                    radioListLayout="block"
                />
            </ListView>
        </InputSection>
    );
}

export default EruInputItem;
