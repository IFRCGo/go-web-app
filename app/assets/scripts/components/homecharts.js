'use strict';
import React from 'react';
import { PropTypes as T } from 'prop-types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { DateTime } from 'luxon';

import { get } from '../utils/utils';
import { environment } from '../config';
import BlockLoading from './block-loading';
import { commaSeparatedLargeNumber } from '../utils/format';

export default class HomeCharts extends React.Component {
  renderChart (data, unit) {
    let tickFormatter;
    let contentDateFormatter;

    switch (unit) {
      case 'month':
        tickFormatter = (date) => DateTime.fromISO(date).toFormat('MMM');
        contentDateFormatter = (date) => DateTime.fromISO(date).toFormat('MMMM yyyy');
        break;
      case 'year':
        tickFormatter = (date) => DateTime.fromISO(date).toFormat('yyyy');
        contentDateFormatter = tickFormatter;
        break;
    }

    const contentFormatter = (payload) => {
      if (!payload.payload[0]) { return null; }

      const item = payload.payload[0].payload;
      return (
        <article className='chart-tooltip chart-tooltip--transparent'>
          <div className='chart-tooltip__contents'>
            <p>{contentDateFormatter(item.timespan)}</p>
            <dl className='tooltip__contents-col appeals-content'>
              <dd>Appeals</dd>
              <dt>{item.appeals.count}</dt>
              <dd>Amount Funded Appeals</dd>
              <dt>{commaSeparatedLargeNumber(item.appeals.amount_funded)}</dt>
              <dd>People Targeted</dd>
              <dt>{commaSeparatedLargeNumber(item.appeals.beneficiaries)}</dt>
            </dl>
            <dl className='tooltip__contents-col drefs-content'>
              <dd>DREFs</dd>
              <dt>{item.drefs.count}</dt>
              <dd>Amount Funded DREFs</dd>
              <dt>{commaSeparatedLargeNumber(item.drefs.amount_funded)}</dt>
              <dd>People Targeted</dd>
              <dt>{commaSeparatedLargeNumber(item.drefs.beneficiaries)}</dt>
            </dl>
          </div>
        </article>
      );
    };

    return (
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis tickFormatter={tickFormatter} dataKey='timespan' axisLine={false} padding={{ left: 16 }} />
          <YAxis axisLine={false} tickLine={false} width={32} padding={{ bottom: 16 }} />
          <Line type='monotone' dataKey='appeals.count' stroke='#C22A26' />
          <Line type='monotone' dataKey='drefs.count' stroke='#F39C12' />
          <Tooltip content={contentFormatter}/>
        </LineChart>
      </ResponsiveContainer>
    );
  }

  renderByMonth () {
    if (!this.props.aggregate['month-drefs'] || !this.props.aggregate['month-appeals']) return null;

    const {
      data: dataDrefs,
      fetched: fetchedDrefs,
      error: errorDrefs
    } = this.props.aggregate['month-drefs'];

    const {
      data: dataAppeals,
      fetched: fetchedAppeals,
      error: errorAppeals
    } = this.props.aggregate['month-appeals'];

    if (!fetchedDrefs || !fetchedAppeals) return null;

    if (errorDrefs || errorAppeals) {
      return (
        <p>Operations data not available.</p>
      );
    }

    const data = dataDrefs.map((o, i) => {
      const {timespan, ...drefData} = o;
      const {timespan: _, ...appealsData} = get(dataAppeals, i, {});

      return {
        timespan: timespan,
        drefs: drefData,
        appeals: appealsData
      };
    });

    return (
      <figure className='chart'>
        <figcaption>DREFS and Appeals Over the Last Year</figcaption>
        <div className='chart__container'>
          {this.renderChart(data, 'month')}
        </div>
      </figure>
    );
  }

  renderByYear () {
    if (!this.props.aggregate['year-drefs'] || !this.props.aggregate['year-appeals']) return null;

    const {
      data: dataDrefs,
      fetched: fetchedDrefs,
      error: errorDrefs
    } = this.props.aggregate['year-drefs'];

    const {
      data: dataAppeals,
      fetched: fetchedAppeals,
      error: errorAppeals
    } = this.props.aggregate['year-appeals'];

    if (!fetchedDrefs || !fetchedAppeals) return null;

    if (errorDrefs || errorAppeals) {
      return (
        <p>Annual statistics not available.</p>
      );
    }

    const data = dataDrefs.map((o, i) => {
      const {timespan, ...drefData} = o;
      const {timespan: _, ...appealsData} = dataAppeals[i];

      return {
        timespan: timespan,
        drefs: drefData,
        appeals: appealsData
      };
    });

    return (
      <figure className='chart'>
        <figcaption>DREFS and Appeals by Year</figcaption>
        <div className='chart__container'>
          {this.renderChart(data, 'year')}
        </div>
      </figure>
    );
  }

  renderLoading () {
    if (this.props.aggregate.fetching) {
      return <BlockLoading/>;
    }
  }

  renderError () {
    if (this.props.aggregate.error) {
      return <p>Aggregate data not available.</p>;
    }
  }

  renderContent () {
    return (
      <div>
        {this.renderByMonth()}
        {this.renderByYear()}
      </div>
    );
  }

  render () {
    return (
      <div className='stats-chart'>
        <h1 className='visually-hidden'>DREFS and Appeals over time</h1>
        {this.renderLoading()}
        {this.renderError()}
        {this.renderContent()}
      </div>
    );
  }
}

if (environment !== 'production') {
  HomeCharts.propTypes = {
    _getAggregateAppeals: T.func,
    aggregate: T.object
  };
}
