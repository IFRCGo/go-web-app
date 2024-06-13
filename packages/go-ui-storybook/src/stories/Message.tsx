import {
    Message as PureMessage,
    MessageProps as PureMessageProps,
} from '@ifrc-go/ui';

interface MessageProps extends PureMessageProps {}

function Message(props: MessageProps) {
    return (
        <PureMessage {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Message;
