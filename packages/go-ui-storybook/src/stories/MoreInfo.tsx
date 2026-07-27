import {
    MoreInfo as PureMoreInfo,
    MoreInfoProps,
} from '@ifrc-go/ui';

function MoreInfo(props: MoreInfoProps) {
    return (
        <PureMoreInfo {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default MoreInfo;
