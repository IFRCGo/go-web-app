import {
    PageHeader as PurePageHeader,
    PageHeaderProps as PurePageHeaderProps,
} from '@ifrc-go/ui';

interface PageHeaderProps extends PurePageHeaderProps {}

function PageHeader(props: PageHeaderProps) {
    return (
        <PurePageHeader {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default PageHeader;
