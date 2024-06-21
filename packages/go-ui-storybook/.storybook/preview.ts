import type { Preview } from "@storybook/react";
import '@ifrc-go/ui/index.css';
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
