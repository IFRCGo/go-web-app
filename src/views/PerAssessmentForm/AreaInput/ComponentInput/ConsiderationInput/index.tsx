import {
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { randomString } from '@togglecorp/fujs';

import TextArea from '#components/TextArea';
import {
    PartialAssessment,
} from '../../../common';

type Value = NonNullable<NonNullable<NonNullable<PartialAssessment['area_responses']>[number]['component_responses']>[number]['consideration_responses']>[number];

interface Props {
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number | undefined;
    value: Value | undefined | null;
    epi_considerations: boolean | null | undefined;
    urban_considerations: boolean | null | undefined;
    climate_environmental_considerations: boolean | null | undefined;
}

function ConsiderationInput(props: Props) {
    const {
        onChange,
        index,
        value,
        epi_considerations,
        urban_considerations,
        climate_environmental_considerations,
    } = props;

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            client_id: randomString(),
        }),
    );

    // FIXME: use translations
    return (
        <>
            {epi_considerations && (
                <TextArea
                    label="EPI Considerations"
                    name="epi_considerations"
                    value={value?.epi_considerations}
                    onChange={setFieldValue}
                />
            )}
            {urban_considerations && (
                <TextArea
                    label="Urban Considerations"
                    name="urban_considerations"
                    value={value?.urban_considerations}
                    onChange={setFieldValue}
                />
            )}
            {climate_environmental_considerations && (
                <TextArea
                    label="Climate and Environmental Considerations"
                    name="climate_environmental_considerations"
                    value={value?.climate_environmental_considerations}
                    onChange={setFieldValue}
                />
            )}
        </>
    );
}

export default ConsiderationInput;
