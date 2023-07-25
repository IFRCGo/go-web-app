import Header from '#components/Header';
import TextOutput from '#components/TextOutput';
import type { paths } from '#generated/riskTypes';

type GetImminentEvents = paths['/api/v1/imminent/']['get'];
type ImminentEventResponse = GetImminentEvents['responses']['200']['content']['application/json'];
type EventItem = NonNullable<ImminentEventResponse['results']>[number];

interface Props {
    data: EventItem;
    icons?: React.ReactNode;
    actions?: React.ReactNode;
}

function EventListItem(props: Props) {
    const {
        data: {
            hazard_name,
            start_date,
        },
        icons,
        actions,
    } = props;

    return (
        <Header
            heading={hazard_name}
            headingLevel={5}
            icons={icons}
            actions={actions}
            spacing="compact"
        >
            <TextOutput
                // FIXME: use translation
                label="Started on"
                value={start_date}
                valueType="date"
            />
        </Header>
    );
}

export default EventListItem;
