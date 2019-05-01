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

import * as React from 'react'
import SizedHorizontalBarChart from './bar-chart/SizedHorizontalBarChart'
import { IconNames } from '@blueprintjs/icons'
import { Card, H3, Position } from '@blueprintjs/core'
import { formatCountShort } from '../util/format'
import { css } from 'emotion'
import styled from 'react-emotion'
import tsvConnector from '../util/tsvConnector'
import { compose, withProps } from 'recompose'
import SpinnerBox from './SpinnerBox'
import LightButton from './LightButton'
import { formatCount } from '../util/format'
import * as R from 'ramda'
import BucketingSelector from './BucketingSelector'
import Tooltip from './Tooltip'

const Body = styled('div')({
  position: 'relative',
  width: '100%',
})

const CloseButtonArea = styled('div')({
  position: 'absolute',
  top: 10,
  right: 10,
})

const cardStyle = css({
  position: 'relative',
})

class CategoryBarChart extends React.Component {
  state = {
    tooltip: null,
  }

  handleValueHover = (item, e) => {
    if (item && e) {
      const { top, left, right } = e.target.getBoundingClientRect()
      this.setState({
        tooltip: {
          target: {
            left: (left + right) / 2,
            top: top - 2,
          },
          children: `${item.y}: ${formatCount(item.x)}`,
        }
      })
    } else {
      this.setState({ tooltip: undefined })
    }
  }

  render() {
    const {
      items,
      attribute: {
        label,
        name,
        type,
        categories,
        bucketings,
      },
      attrBreakdownFetch: {
        pending,
        refreshing,
        rejected,
        fulfilled,
        reason,
      },
      selectedValue,
      selectedBucketing,
      onSelectValue,
      onClose,
      onChangeBucketing,
    } = this.props
    const {
      tooltip,
    } = this.state
    let body
    if (pending) {
      body = <div/>
    } else if (rejected) {
      body = <div>{`${reason}`}</div>
    } else if (fulfilled) {
      body = (
        <SizedHorizontalBarChart
          xTickFormat={formatCountShort}
          yTickFormat={
            type === 'category' && categories ?
              value => R.pathOr(value, ['label'], categories.find(c => c.name === value))
              : undefined
          }
          onValueMouseOver={this.handleValueHover}
          onValueClick={(item) => onSelectValue(item.y)}
          dataPoints={items}
        />
      )
    }
    return (
      <Card className={cardStyle}>
        {refreshing && <SpinnerBox top={7} right={7} size={17} /> }
        <H3>{label || name}</H3>
        {bucketings &&
          <div className={css({ marginBottom: 10 })}>
            <BucketingSelector
              selectedBucketing={selectedBucketing}
              bucketings={bucketings}
              onChange={onChangeBucketing}
            />
          </div>
        }
        <Body className={css({
          height: (items ? items.length : 3) * 20 + 40
        })}>
          {body}
        </Body>
        {!refreshing &&
        <CloseButtonArea>
          <LightButton
            onClick={onClose}
            rightIcon={selectedValue ? IconNames.CROSS : IconNames.DELETE}
            minimal
          >
            {selectedValue ? 'Clear filter' : 'Remove attr'}
          </LightButton>
        </CloseButtonArea>}
        {tooltip && <Tooltip {...tooltip} position={Position.TOP} />}
      </Card>
    )
  }
}

export default compose(
  tsvConnector(
    ([ category, count ]) => ({
      y: category,
      x: +count,
      color: 'SELECTED',
    })
  )(({ datasetName, attribute, filters, bucketings }) => ({
    attrBreakdownFetch: {
      url: `/${datasetName}/api/attr-breakdown/${attribute.name}`,
      method: 'POST',
      body: JSON.stringify({ filters, bucketings }),
      refreshing: true, // avoids the existing PromiseState from being cleared while fetch is in progress
    },
  })),
  withProps(({ attribute, selectedValue, attrBreakdownFetch: { value }}) => ({
    items: value && selectedValue ?
      value.map(v => ({
        ...v,
        color: v.y === selectedValue ? 'SELECTED' : 'NOT_SELECTED',
      }))
      : value
  })),
)(CategoryBarChart)
