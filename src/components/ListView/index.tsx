import List, {
    Props as ListProps,
    GroupCommonProps,
    OptionKey,
} from '#components/List';
import Message, {
    Props as MessageProps,
} from './Message';

type MessagePropOmission = 'className' | 'message' | 'empty' | 'pending' | 'errored';

export type Props<
  D,
  P,
  K extends OptionKey,
  GP extends GroupCommonProps,
  GK extends OptionKey
  > = ListProps<D, P, K, GP, GK> &
  Omit<MessageProps, MessagePropOmission> & {
    className?: string;
    errored: boolean;
    pending: boolean;
  };

function ListView<
  D,
  P,
  K extends OptionKey,
  GP extends GroupCommonProps,
  GK extends OptionKey
>(props: Props<D, P, K, GP, GK>) {
    const {
        className,
        errored,
        pending,
        data,
        emptyMessage,
        pendingMessage,
        erroredMessage,
        ...otherListProps
    } = props;
    const empty = !(data?.length && data.length > 0);

    return (
        <>
            <Message
                empty={empty}
                pending={pending}
                errored={errored}
                pendingMessage={pendingMessage}
                emptyMessage={emptyMessage}
                erroredMessage={erroredMessage}
            />
            {!errored && (
                <List
                    data={data}
                    {...otherListProps}
                />
            )}
        </>
    );
}

export default ListView;
