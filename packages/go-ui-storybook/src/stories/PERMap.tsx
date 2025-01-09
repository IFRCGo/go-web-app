import type { PERMapProps } from '@ifrc-go/ui';
import { PERMap as PurePERMap } from '@ifrc-go/ui';

function StoryPERMap(props: PERMapProps) {
    return (
        <div style={{ width: '800px', height: '400px' }}>
            <PurePERMap
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </div>
    );
}

export default StoryPERMap;
