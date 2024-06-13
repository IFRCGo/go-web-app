import {
    HtmlOutput as PureHtmlOutput,
    HtmlOutputProps as PureHtmlOutputProps,
} from '@ifrc-go/ui';

interface HtmlOutputProps extends PureHtmlOutputProps {}

function HtmlOutput(props:HtmlOutputProps) {
    return (
        <PureHtmlOutput {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default HtmlOutput;
