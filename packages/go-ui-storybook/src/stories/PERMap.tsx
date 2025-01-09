import type { PERMapProps } from '@ifrc-go/ui';
import { PERMap as PurePERMap } from '@ifrc-go/ui';

function StoryPERMap(props: PERMapProps) {
    return (
        <div style={{ width: '800px', height: '400px' }}>
            <PurePERMap {...props} /> 
        </div>
    );
}

export default StoryPERMap;
