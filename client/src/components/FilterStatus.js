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
import { ProgressBar, Spinner, Intent } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as R from 'ramda'
import styled from '@emotion/styled'
import tsvConnector from '../util/tsvConnector'
import { formatCount } from '../util/format'
import { withProps, branch } from 'recompose'
import Filler from './Filler'
import LightButton from './LightButton'

const Outer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  marginTop: 10,
  '& > * + *': {
    marginTop: 7,
  },
  '& > *': {
    display: 'flex',
    flexGrow: 1,
  },
})

const Row = styled('div')({
  display: 'flex',
  alignItems: 'center',
  minHeight: 30,
  '& > * + *': {
    marginLeft: '.25em',
  }
})



const FilterStatus = ({
  totalTripCountFetch,
  filterTripCountFetch,
  filters,
  selectedAttrs,
  hasFilter,
  onClear,
}) => {

  const totalTripCount = R.path(['value', 0], totalTripCountFetch)
  const filterTripCount = R.path(['value', 0], filterTripCountFetch)
  const isLoading = totalTripCountFetch.pending || (hasFilter && filterTripCountFetch.pending)

  return (
    <Outer>
      <ProgressBar
        animate={hasFilter && isLoading}
        intent={Intent.PRIMARY}
        stripes={hasFilter && isLoading}
        value={hasFilter ? filterTripCount / totalTripCount : 1.0}
        />
      <Row>
        {isLoading ?
          <Spinner size={15}/>
          :
          <span>{hasFilter ?
            `${formatCount(filterTripCount)} of ${formatCount(totalTripCount)} trips`
            :
            `All ${formatCount(totalTripCount)} trips`
          }</span>
        }
        <Filler />
        {hasFilter && <LightButton
          minimal
          onClick={onClear}
          rightIcon={IconNames.CROSS}
        >
          Clear all filters
        </LightButton>}
      </Row>
    </Outer>
  )
}


export default R.compose(
  withProps(
    props => ({
      hasFilter: !R.isEmpty(props.filters),
    })
  ),
  tsvConnector(
    ([ totalTripCount ]) => totalTripCount
  )(({ datasetName }) => ({
    totalTripCountFetch: {
      url: `/${datasetName}/api/count-total-trips`,
      method: 'GET',
    }
  })),
  branch(
    props => props.hasFilter,
    tsvConnector(
      ([ filterTripCount ]) => filterTripCount
    )(({ datasetName, filters }) => ({
      filterTripCountFetch: {
        url: `/${datasetName}/api/count-trips`,
        method: 'POST',
        body: JSON.stringify({ filters }),
      }
    }))
  ),
)(FilterStatus)
