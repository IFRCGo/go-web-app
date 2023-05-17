import React from 'react';
import Heading from '#components/Heading';
import Card from '#components/Card';

import styles from './styles.module.css';

function Cards() {
    return (
        <div className={styles.cardsCollection}>
            <Heading level={5}>
                BASIC CARD EXAMPLE
            </Heading>
            <Card
                value={8}
                description="This is UI Card"
            />
            <Heading level={5}>
                CARD EXAMPLE WITH PROGRESS BAR
            </Heading>
            <Card
                value={1000000}
                progressTotalValue={2000000}
                normalize
                progressBar
                description="50% received"
                title="This is test card templete"
            />
        </div>
    );
}

export default Cards;
