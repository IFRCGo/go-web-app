import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    status: string;
    rating: number;
    className?: string;
}

const STATUS_COLORS = {
    "Doesn't exist": '#E0E3E7',
    'Partially exists': '#99A5B3',
    'Needs improvement': '#7D8B9D',
    'Good performing': '#4D617A',
    'High performing': '#011E41',
} as const;

function RatingStatusBadge({ status, rating, className }: Props) {
    const fillWidth = `${(rating / 5) * 100}%`;

    return (
        <div
            className={_cs(styles.ratingStatus, className)}
            style={{
                backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#000000',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: fillWidth,
                    backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#000000',
                    opacity: 1,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: fillWidth,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#000000',
                    opacity: 0.3,
                }}
            />
            <span style={{ position: 'relative', zIndex: 1 }}>
                {status}
            </span>
        </div>
    );
}

export default RatingStatusBadge;
