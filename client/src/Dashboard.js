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

import React, {Component} from 'react'
import Sidebar from './components/Sidebar'
import CategoryBarChart from './components/CategoryBarChart'
import * as R from 'ramda'
import AttrSelector from './components/AttrSelector'
import MapView from './MapView'
import { H2 } from '@blueprintjs/core'
import styled from '@emotion/styled'
import FilterStatus from './components/FilterStatus'
import Filler from './components/Filler'
import { formatDateShort } from './util/format'
import { parseLocalTime } from './util/format'
import WeatherChart from './WeatherChart'


const MapContainer = styled('div')({
  display: 'flex',
  flexGrow: 1,
  order: 3,
  position: 'relative',
})

const Title = styled('div')({
  fontWeight: 'bold',
})

const Cell = styled('div')({
  display: 'flex',
  width: '100%',
  flexGrow: 1,
})

const Outer = styled('div')({
  display: 'flex',
  width: '100%',
  '& > div': {
    padding: 10,
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'center',
  }
})

const Column = styled('div')({
  padding: 10,
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'column',
  alignItems: 'center',
  '& > *+*': {
    marginTop: 20,
  }
})


const Row = styled('div')({
  padding: 10,
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'row',
  alignItems: 'center',
  '& > *+*': {
    marginLeft: 20,
  }
})




export default class Dashboard extends Component {
  state = {
    filters: {},
    selectedLocations: [],
    bucketings: {},
    selectedAttrs: [],
  }

  handleRemoveAttr = (attrName) =>
    this.setState(prevState => {
      const { filters, selectedAttrs } = prevState
      if (R.has(attrName, filters)) {
        return {
          ...prevState,
          filters: R.omit([attrName], filters),
        }
      } else {
        return {
          ...prevState,
          selectedAttrs: R.without([attrName], selectedAttrs),
        }
      }
    })

  handleSelectLocation = (id) => {
    this.setState(prevState => {
      const prev = prevState.selectedLocations
      let next
      if (prev) {
        if (R.contains(id, prev)) {
          next = R.without(id, prev)
          if (R.isEmpty(next)) next = null
        } else {
          next = [...prev, id]
        }
      } else {
        next = [id]
      }
      return ({
        ...prevState,
        selectedLocations: next,
      })
    })
  }

  handleClearFilters = (attrName) =>
    this.setState(prevState => ({
      ...prevState,
      filters: {},
    }))

  handleSelectAttr = (attrName) =>
    this.setState(prevState => ({
      ...prevState,
      selectedAttrs: [attrName, ...prevState.selectedAttrs]
    }))

  handleFilterValue = (attrName, value) =>
    this.setState(prevState => ({
      filters: {
        ...prevState.filters,
        [attrName]: value === prevState.filters[attrName] ? undefined : value,
      }
    }))

  render() {
    const {
      dataset: {
        title,
        name: datasetName,
        description,
        timePeriod,
        lastUpdated,
        attributes,
      },
    } = this.props
    const {
      filters,
      selectedLocations,
      bucketings,
      selectedAttrs,
    } = this.state
    return (
      <Outer>
        <Column>
          <Cell>
            <WeatherChart
              datasetName={datasetName}
            />
          </Cell>
          <Row>
            <Column>
              <Title>Time 1</Title>
              <Cell>

              </Cell>
            </Column>
            <Column>
              <Title>Time 2</Title>
              <Cell>

              </Cell>
            </Column>
          </Row>
        </Column>
      </Outer>
    )
  }
}

