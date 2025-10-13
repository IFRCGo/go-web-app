import { isTruthyString } from '@togglecorp/fujs';

import PrintableContainer from '#components/printable/PrintableContainer';
import PrintableDataDisplay from '#components/printable/PrintableDataDisplay';
import { type GoApiResponse } from '#utils/restRequest';

type SimplifiedEap = GoApiResponse<'/api/v2/simplified-eap/{id}/'>;
type FieldKeys = keyof SimplifiedEap;

type ExtractContactPrefix<KEY extends FieldKeys> = KEY extends `${infer PREFIX}_name`
    ? `${PREFIX}_title` extends FieldKeys
        ? `${PREFIX}_email` extends FieldKeys
            ? `${PREFIX}_phone_number` extends FieldKeys
                ? PREFIX
                : never
            : never
        : never
    : never

type ValidContactFieldPrefixes = ExtractContactPrefix<FieldKeys>;

interface Props {
    label: React.ReactNode;
    namePrefix: ValidContactFieldPrefixes;
    data: SimplifiedEap | undefined | null;
    prevData: SimplifiedEap | undefined | null;
    withDiff: boolean;
}

function PrintableContactOutput(props: Props) {
    const {
        label,
        namePrefix,
        data,
        prevData,
        withDiff,
    } = props;

    const nameKey = `${namePrefix}_name` satisfies FieldKeys;
    const titleKey = `${namePrefix}_title` satisfies FieldKeys;
    const emailKey = `${namePrefix}_email` satisfies FieldKeys;
    const phoneNumberKey = `${namePrefix}_phone_number` satisfies FieldKeys;

    const value = [
        data?.[nameKey],
        data?.[titleKey],
        data?.[emailKey],
        data?.[phoneNumberKey],
    ].filter(isTruthyString).join(', ');

    const prevValue = [
        prevData?.[nameKey],
        prevData?.[titleKey],
        prevData?.[emailKey],
        prevData?.[phoneNumberKey],
    ].filter(isTruthyString).join(', ');

    return (
        <PrintableContainer
            headingLevel={6}
            heading={label}
        >
            <PrintableDataDisplay
                value={value}
                valueType="text"
                prevValue={prevValue}
                strongLabel
                withDiff={withDiff}
                invalidText={null}
            />
        </PrintableContainer>
    );
}

export default PrintableContactOutput;
