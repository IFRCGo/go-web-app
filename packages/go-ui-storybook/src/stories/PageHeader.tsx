import {
    PageHeader as PurePageHeader,
    PageHeaderProps,
} from '@ifrc-go/ui';

function PageHeader(props: PageHeaderProps) {
    return (
        <PurePageHeader {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default PageHeader;
