import {
    Message as PureMessage,
    type MessageProps,
} from '@ifrc-go/ui';

function Message(props: MessageProps) {
    return (
        <PureMessage {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Message;
