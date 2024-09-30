import {
    HtmlOutput as PureHtmlOutput,
    type HtmlOutputProps,
} from '@ifrc-go/ui';

function HtmlOutput(props:HtmlOutputProps) {
    return (
        <PureHtmlOutput {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default HtmlOutput;
