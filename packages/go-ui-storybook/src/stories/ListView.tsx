import {
    ListView as PureListView,
    ListViewProps,
} from '@ifrc-go/ui';

function ListView(props: ListViewProps) {
    return (
        <PureListView {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default ListView;
