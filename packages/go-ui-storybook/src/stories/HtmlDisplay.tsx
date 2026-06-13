import {
    HtmlDisplay as PureHtmlDisplay,
    HtmlDisplayProps,
} from '@ifrc-go/ui';

function HtmlDisplay(props:HtmlDisplayProps) {
    return (
        <PureHtmlDisplay {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default HtmlDisplay;
