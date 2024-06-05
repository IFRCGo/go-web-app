import '@ifrc-go/ui/index.css';
import type { Preview } from "@storybook/react";

import '../src/stories/index.css';

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
    tags: ["autodocs"]
};

export default preview;
