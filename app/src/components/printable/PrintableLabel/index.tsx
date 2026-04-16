import DiffTextOutput from '../DiffTextOutput';

interface Props {
    value?: string | null;
    withDiff?: boolean;
    prevValue?: string | null;
}

function PrintableLabel(props: Props) {
    const {
        value,
        prevValue,
        withDiff,
    } = props;

    return (
        <DiffTextOutput
            value={value}
            prevValue={prevValue}
            withDiff={withDiff}
        />
    );
}

export default PrintableLabel;
