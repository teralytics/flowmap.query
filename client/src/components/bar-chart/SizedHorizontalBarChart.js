/*
 *    Copyright 2019 Teralytics
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 */

import * as R from 'ramda'
import * as React from 'react'
import { HorizontalBarSeries, VerticalGridLines, XAxis, XYPlot, YAxis } from 'react-vis'
import { Colors } from '@blueprintjs/core'
import { defaultMemoize } from 'reselect'
import YAxisTick from './YAxisTick'
import withDimensions from '../../util/withDimensions'

export const dataColors = {
  dimmed: Colors.LIGHT_GRAY3,
  normal: Colors.BLUE3,
  normalLight: Colors.BLUE5,
  normalDark: Colors.BLUE1,
  positive: Colors.TURQUOISE3,
  positiveLight: Colors.TURQUOISE5,
  positiveDark: Colors.TURQUOISE1,
  negative: Colors.GOLD3,
  negativeLight: Colors.GOLD5,
  negativeDark: Colors.GOLD1,
};

export const COLOR_DOMAIN = [
  'NOT_SELECTED',
  'SELECTED',
  'HIGHLIGHTED',
  'POS_SELECTED',
  'POS_HIGHLIGHTED',
  'NEG_SELECTED',
  'NEG_HIGHLIGHTED',
];

export const COLOR_RANGE = [
  dataColors.dimmed,
  dataColors.normal,
  dataColors.normalLight,
  dataColors.positive,
  dataColors.positiveLight,
  dataColors.negative,
  dataColors.negativeLight,
];

const margin = {
  left: 100,
  right: 32,
  top: 0,
  bottom: 32,
}

const AXIS_LINE_COLOR = Colors.LIGHT_GRAY3
const AXIS_TEXT_COLOR = Colors.DARK_GRAY1

const getStyles = defaultMemoize((filterable) => {
  const cursor = filterable ? 'pointer' : 'auto'
  return {
    barSeries: {
      cursor,
    },
    xAxis: {
      line: {
        stroke: AXIS_LINE_COLOR,
        strokeWidth: 1,
      },
      ticks: {
        stroke: AXIS_LINE_COLOR,
      },
      text: {
        fontSize: 9,
        fill: AXIS_TEXT_COLOR,
        stroke: 'none',
      },
    },
    yAxis: {
      line: {
        stroke: AXIS_LINE_COLOR,
        strokeWidth: 1,
      },
      ticks: {
        stroke: AXIS_LINE_COLOR,
      },
      text: {
        fontSize: 11,
        fill: AXIS_TEXT_COLOR,
        stroke: 'none',
        cursor,
      },
    },
  }
})

class SizedHorizontalBarChart extends React.PureComponent {
  render() {
    const { width, height, dataPoints, order, xTickFormat, onValueClick } = this.props
    const styles = getStyles(!R.isNil(onValueClick))
    return (
      <XYPlot
        yType="ordinal"
        yDomain={order}
        xType="linear"
        colorType="category"
        colorDomain={COLOR_DOMAIN}
        colorRange={COLOR_RANGE}
        onMouseLeave={this.handlePlotMouseLeave}
        {...{ width, height, margin }}
      >
        <VerticalGridLines />
        <HorizontalBarSeries
          data={dataPoints}
          style={styles.barSeries}
          onValueClick={onValueClick}
          onValueMouseOver={this.handleValueMouseOver}
          onValueMouseOut={this.handlePlotMouseLeave}
        />
        <YAxis tickFormat={this.yTickFormatter} style={styles.yAxis} />
        <XAxis tickFormat={xTickFormat} tickTotal={4} style={styles.xAxis} />
      </XYPlot>
    )
  }

  yTickFormatter = (value) => {
    const { yTickFormat } = this.props
    return (
      <YAxisTick
        onTextClick={this.handleYAxisTickClick}
        onTextHover={this.handleYAxisTickHover}
        value={yTickFormat ? yTickFormat(value) : value}
      />
    )
  }

  handleValueMouseOver = (dp, e) => {
    const { onValueMouseOver } = this.props
    if (onValueMouseOver) {
      onValueMouseOver(dp, e.event)
    }
  }

  handlePlotMouseLeave = () => {
    const { onValueMouseOver } = this.props
    if (onValueMouseOver) {
      onValueMouseOver(undefined)
    }
  }

  handleYAxisTickClick = (value) => {
    const { dataPoints, onValueClick } = this.props
    if (onValueClick) {
      const dataPoint = dataPoints.find(dp => dp.y.toString() === value)
      if (dataPoint) {
        onValueClick(dataPoint)
      }
    }
  }

  handleYAxisTickHover = (value, e) => {
    const { dataPoints, onValueMouseOver } = this.props
    if (onValueMouseOver) {
      const dataPoint = dataPoints.find(dp => dp.y.toString() === value)
      if (dataPoint) {
        onValueMouseOver(dataPoint, e)
      }
    }
  }
}

const enhance = withDimensions()
export default enhance(SizedHorizontalBarChart)
