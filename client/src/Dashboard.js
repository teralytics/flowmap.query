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
import { H2, Slider } from '@blueprintjs/core'
import styled from '@emotion/styled'
import FilterStatus from './components/FilterStatus'
import Filler from './components/Filler'
import { formatDateShort } from './util/format'
import { parseLocalTime } from './util/format'
import WeatherChart from './WeatherChart'
import { timeFormat } from 'd3-time-format'
import TimeRuler from './TimeRuler'


const MapContainer = styled('div')({
  display: 'flex',
  flexGrow: 1,
  order: 3,
  position: 'relative',
  height: '100%',
})

const Title = styled('div')({
  fontWeight: 'bold',
})

const Cell = styled('div')({
  display: 'flex',
  width: '100%',
  height: '100%',
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
  },
  '& .bp3-slider': {
    height: 'auto !important',
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

const SliderLabel = styled('div')({
  whiteSpace: 'nowrap',
  fontSize: '8px',
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



const dates = [
  '2018-01-01',
  '2018-01-02',
  '2018-01-03',
  '2018-01-04',
  '2018-01-05',
  '2018-01-06',
  '2018-01-07',
  '2018-01-08',
  '2018-01-09',
  '2018-01-10',
  '2018-01-11',
  '2018-01-12',
  '2018-01-13',
  '2018-01-14',
  '2018-01-15',
  '2018-01-16',
  '2018-01-17',
  '2018-01-18',
  '2018-01-19',
  '2018-01-20',
  '2018-01-21',
  '2018-01-22',
  '2018-01-23',
  '2018-01-24',
  '2018-01-25',
  '2018-01-26',
  '2018-01-27',
  '2018-01-28',
  '2018-01-29',
  '2018-01-30',
  '2018-01-31',
  '2018-02-01',
  '2018-02-02',
  '2018-02-03',
  '2018-02-04',
  '2018-02-05',
  '2018-02-06',
  '2018-02-07',
  '2018-02-08',
  '2018-02-09',
  '2018-02-10',
  '2018-02-11',
  '2018-02-12',
  '2018-02-13',
  '2018-02-14',
  '2018-02-15',
  '2018-02-16',
  '2018-02-17',
  '2018-02-18',
  '2018-02-19',
  '2018-02-20',
  '2018-02-21',
  '2018-02-22',
  '2018-02-23',
  '2018-02-24',
  '2018-02-25',
  '2018-02-26',
  '2018-02-27',
  '2018-02-28',
  '2018-03-01',
  '2018-03-02',
  '2018-03-03',
  '2018-03-04',
  '2018-03-05',
  '2018-03-06',
  '2018-03-07',
  '2018-03-08',
  '2018-03-09',
  '2018-03-10',
  '2018-03-11',
  '2018-03-12',
  '2018-03-13',
  '2018-03-14',
  '2018-03-15',
  '2018-03-16',
  '2018-03-17',
  '2018-03-18',
  '2018-03-19',
  '2018-03-20',
  '2018-03-21',
  '2018-03-22',
  '2018-03-23',
  '2018-03-24',
  '2018-03-25',
  '2018-03-26',
  '2018-03-27',
  '2018-03-28',
  '2018-03-29',
  '2018-03-30',
  '2018-03-31',
  '2018-04-01',
  '2018-04-02',
  '2018-04-03',
  '2018-04-04',
  '2018-04-05',
  '2018-04-06',
  '2018-04-07',
  '2018-04-08',
  '2018-04-09',
  '2018-04-10',
  '2018-04-11',
  '2018-04-12',
  '2018-04-13',
  '2018-04-14',
  '2018-04-15',
  '2018-04-16',
  '2018-04-17',
  '2018-04-18',
  '2018-04-19',
  '2018-04-20',
  '2018-04-21',
  '2018-04-22',
  '2018-04-23',
  '2018-04-24',
  '2018-04-25',
  '2018-04-26',
  '2018-04-27',
  '2018-04-28',
  '2018-04-29',
  '2018-04-30',
  '2018-05-01',
  '2018-05-02',
  '2018-05-03',
  '2018-05-04',
  '2018-05-05',
  '2018-05-06',
  '2018-05-07',
  '2018-05-08',
  '2018-05-09',
  '2018-05-10',
  '2018-05-11',
  '2018-05-12',
  '2018-05-13',
  '2018-05-14',
  '2018-05-15',
  '2018-05-16',
  '2018-05-17',
  '2018-05-18',
  '2018-05-19',
  '2018-05-20',
  '2018-05-21',
  '2018-05-22',
  '2018-05-23',
  '2018-05-24',
  '2018-05-25',
  '2018-05-26',
  '2018-05-27',
  '2018-05-28',
  '2018-05-29',
  '2018-05-30',
  '2018-05-31',
  '2018-06-01',
  '2018-06-02',
  '2018-06-03',
  '2018-06-04',
  '2018-06-05',
  '2018-06-06',
  '2018-06-07',
  '2018-06-08',
  '2018-06-09',
  '2018-06-10',
  '2018-06-11',
  '2018-06-12',
  '2018-06-13',
  '2018-06-14',
  '2018-06-15',
  '2018-06-16',
  '2018-06-17',
  '2018-06-18',
  '2018-06-19',
  '2018-06-20',
  '2018-06-21',
  '2018-06-22',
  '2018-06-23',
  '2018-06-24',
  '2018-06-25',
  '2018-06-26',
  '2018-06-27',
  '2018-06-28',
  '2018-06-29',
  '2018-06-30',
  '2018-07-01',
  '2018-07-02',
  '2018-07-03',
  '2018-07-04',
  '2018-07-05',
  '2018-07-06',
  '2018-07-07',
  '2018-07-08',
  '2018-07-09',
  '2018-07-10',
  '2018-07-11',
  '2018-07-12',
  '2018-07-13',
  '2018-07-14',
  '2018-07-15',
  '2018-07-16',
  '2018-07-17',
  '2018-07-18',
  '2018-07-19',
  '2018-07-20',
  '2018-07-21',
  '2018-07-22',
  '2018-07-23',
  '2018-07-24',
  '2018-07-25',
  '2018-07-26',
  '2018-07-27',
  '2018-07-28',
  '2018-07-29',
  '2018-07-30',
  '2018-07-31',
  '2018-08-01',
  '2018-08-02',
  '2018-08-03',
  '2018-08-04',
  '2018-08-05',
  '2018-08-06',
  '2018-08-07',
  '2018-08-08',
  '2018-08-09',
  '2018-08-10',
  '2018-08-11',
  '2018-08-12',
  '2018-08-13',
  '2018-08-14',
  '2018-08-15',
  '2018-08-16',
  '2018-08-17',
  '2018-08-18',
  '2018-08-19',
  '2018-08-20',
  '2018-08-21',
  '2018-08-22',
  '2018-08-23',
  '2018-08-24',
  '2018-08-25',
  '2018-08-26',
  '2018-08-27',
  '2018-08-28',
  '2018-08-29',
  '2018-08-30',
  '2018-08-31',
  '2018-09-01',
  '2018-09-02',
  '2018-09-03',
  '2018-09-04',
  '2018-09-05',
  '2018-09-06',
  '2018-09-07',
  '2018-09-08',
  '2018-09-09',
  '2018-09-10',
  '2018-09-11',
  '2018-09-12',
  '2018-09-13',
  '2018-09-14',
  '2018-09-15',
  '2018-09-16',
  '2018-09-17',
  '2018-09-18',
  '2018-09-19',
  '2018-09-20',
  '2018-09-21',
  '2018-09-22',
  '2018-09-23',
  '2018-09-24',
  '2018-09-25',
  '2018-09-26',
  '2018-09-27',
  '2018-09-28',
  '2018-09-29',
  '2018-09-30',
  '2018-10-01',
  '2018-10-02',
  '2018-10-03',
  '2018-10-04',
  '2018-10-05',
  '2018-10-06',
  '2018-10-07',
  '2018-10-08',
  '2018-10-09',
  '2018-10-10',
  '2018-10-11',
  '2018-10-12',
  '2018-10-13',
  '2018-10-14',
  '2018-10-15',
  '2018-10-16',
  '2018-10-17',
  '2018-10-18',
  '2018-10-19',
  '2018-10-20',
  '2018-10-21',
  '2018-10-22',
  '2018-10-23',
  '2018-10-24',
  '2018-10-25',
  '2018-10-26',
  '2018-10-27',
  '2018-10-28',
  '2018-10-29',
  '2018-10-30',
  '2018-10-31',
  '2018-11-01',
  '2018-11-02',
  '2018-11-03',
  '2018-11-04',
  '2018-11-05',
  '2018-11-06',
  '2018-11-07',
  '2018-11-08',
  '2018-11-09',
  '2018-11-10',
  '2018-11-11',
  '2018-11-12',
  '2018-11-13',
  '2018-11-14',
  '2018-11-15',
  '2018-11-16',
  '2018-11-17',
  '2018-11-18',
  '2018-11-19',
  '2018-11-20',
  '2018-11-21',
  '2018-11-22',
  '2018-11-23',
  '2018-11-24',
  '2018-11-25',
  '2018-11-26',
  '2018-11-27',
  '2018-11-28',
  '2018-11-29',
  '2018-11-30',
  '2018-12-01',
  '2018-12-02',
  '2018-12-03',
  '2018-12-04',
  '2018-12-05',
  '2018-12-06',
  '2018-12-07',
  '2018-12-08',
  '2018-12-09',
  '2018-12-10',
  '2018-12-11',
  '2018-12-12',
  '2018-12-13',
  '2018-12-14',
  '2018-12-15',
  '2018-12-16',
  '2018-12-17',
  '2018-12-18',
  '2018-12-19',
  '2018-12-20',
  '2018-12-21',
  '2018-12-22',
  '2018-12-23',
  '2018-12-24',
  '2018-12-25',
  '2018-12-26',
  '2018-12-27',
  '2018-12-28',
  '2018-12-29',
  '2018-12-30',
  '2018-12-31',
]

export const dateToString = timeFormat('%a, %Y-%m-%d')

const sliderLabelRenderer = i => {
  const date = dates[i]
  const d = new Date(date)
  return <SliderLabel>{dateToString(d)}</SliderLabel>
}


export default class Dashboard extends Component {
  state = {
    filters: {},
    selectedLocations: [],
    bucketings: {},
    selectedAttrs: [],
    selectedDate1: '2018-01-15',
    selectedDate2: '2018-07-02',
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

  handleSelectedDate1 = (selectedDate1) =>
    this.setState(prevState => ({
      selectedDate1
    }))

  handleSelectedDate2 = (selectedDate2) =>
    this.setState(prevState => ({
      selectedDate2
    }))


  handleMapViewStateChange = (mapViewState) =>
    this.setState(prevState => ({
      mapViewState,
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
      selectedDate1,
      selectedDate2,
    } = this.state
    return (
      <Outer>
        <Column>
          <WeatherChart
            datasetName={datasetName}
            selectedDate1={selectedDate1}
            selectedDate2={selectedDate2}
          />
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            position: 'relative',
          }}>
            <Slider
              showTrackFill={false}
              min={0}
              max={dates.length - 1}
              labelStepSize={1000}
              stepSize={1}
              onChange={i => this.handleSelectedDate2(dates[i])}
              labelRenderer={() => null}
              value={dates.indexOf(selectedDate2)}
            />
            <Slider
              showTrackFill={false}
              min={0}
              max={dates.length - 1}
              stepSize={1}
              labelStepSize={1000}
              onChange={i => this.handleSelectedDate1(dates[i])}
              labelRenderer={() => null}
              value={dates.indexOf(selectedDate1)}
            />
          </div>
          <Cell>
            <Row>
              <MapContainer>
                <MapView
                  datasetName={datasetName}
                  viewState={this.state.mapViewState}
                  filters={{
                    start_date: selectedDate1,
                  }}
                  selectedLocations={selectedLocations}
                  bucketings={bucketings}
                  onSelectLocation={this.handleSelectLocation}
                  onViewStateChange={this.handleMapViewStateChange}
                />
              </MapContainer>
              <MapContainer>
                <MapView
                  viewState={this.state.mapViewState}
                  datasetName={datasetName}
                  filters={{
                    start_date: selectedDate2,
                  }}
                  selectedLocations={selectedLocations}
                  bucketings={bucketings}
                  onSelectLocation={this.handleSelectLocation}
                  onViewStateChange={this.handleMapViewStateChange}
                />
              </MapContainer>
            </Row>
          </Cell>
        </Column>
      </Outer>
    )
  }
}

