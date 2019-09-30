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
import { connect } from 'react-refetch'
import * as topojson from 'topojson-client'
import { geoCentroid } from 'd3-geo'
import { scaleLinear, scaleTime } from 'd3-scale'
import { schemeDark2 } from 'd3-scale-chromatic'
import { extent, max } from 'd3-array'
import { hcl } from 'd3-color'
import { timeFormat } from 'd3-time-format'
import { timeDay } from 'd3-time'
import tsvConnector from './util/tsvConnector'
import withDimensions from './util/withDimensions'
import styled from '@emotion/styled'
import { compose } from 'recompose'
import TimeRuler from './TimeRuler'
import { parseLocalTime } from './util/format'
import { dateToString } from './Dashboard'


const Outer = styled('div')({
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  paddingTop: 10,
})



const BarsOuter = styled.div({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  paddingTop: 30,
})

const BarsTitle = styled.div({
  position: 'absolute',
  width: '100%',
  height: '100%',
  fontWeight: 'bold',
  textShadow: '1px -1px 2px #fff, 1px 1px 2px #fff, -1px -1px 2px #fff, -1px 1px 2px #fff',
})

const Bars = ({ width, height, data, title, color, accessor }) => {
  const w = Math.floor(width / data.length)
  const x = scaleTime()
    .domain(extent(data, d => d.date))
    .range([0, width])
  const y = scaleLinear()
    .domain([0, max(data, accessor)])
    .range([0, height])
  // console.log(title+'\n'+
  //   data.map(d => [timeFormat('%Y-%m-%d')(d.date),accessor(d)].join('\t')).join('\n'))
  const hclColor = hcl(color)
  hclColor.c *= 0.25
  hclColor.l *= 1.1
  const weekendColor = hclColor.toString()
  return (
    <BarsOuter>
      <BarsTitle>{title}</BarsTitle>
      <svg width={width} height={height + 5}>
        {
          data.map(
            (d, i) =>
              <React.Fragment key={i}>
                {
                  (d.date.getDay() === 0 &&
                      <line
                        stroke="#ccc"
                        x1={x(d.date)+w}
                        x2={x(d.date)+w}
                        y1={height}
                        y2={height+5}
                      />
                  )
                }
                <rect
                  // shapeRendering="crispEdges"
                  fill={d.date.getDay() === 0 || d.date.getDay() === 6 ? weekendColor : color}
                  x={x(d.date)}
                  y={height - y(accessor(d))}
                  width={w}
                  height={y(accessor(d))}
                />
              </React.Fragment>
          )
        }
      </svg>
    </BarsOuter>
  )
}


const WeatherChart = ({
  width,
  height,
  weatherFetch,
  tripsByDateFetch,
  tripsByDateGender1Fetch,
  tripsByDateGender2Fetch,
  avgDurationFetch,
  selectedDate1,
  selectedDate2,
}) => {
  if (!weatherFetch.fulfilled ||
    !tripsByDateFetch.fulfilled  ||
    !tripsByDateGender1Fetch.fulfilled  ||
    !tripsByDateGender2Fetch.fulfilled  ||
    !avgDurationFetch.fulfilled
  ) {
    return 'Loading…'
  }
  const h = 50
  return (
    <Outer>
      <TimeRuler
        value={new Date(selectedDate1)}
        from={new Date('2018-01-01')}
        to={new Date('2018-12-31')}
        width={width}
        height={height}
        withRounding={timeDay.round}
      >
        {(value) => (
          <div
            style={{
              fontSize: 12,
              marginLeft: 15,
              background: 'white',
              padding: 2,
            }}
          >
            {dateToString(new Date(selectedDate1))}
          </div>
        )}
      </TimeRuler>
      <TimeRuler
        value={new Date(selectedDate2)}
        from={new Date('2018-01-01')}
        to={new Date('2018-12-31')}
        width={width}
        height={height}
        withRounding={timeDay.round}
      >
        {(value) => (
          <div
            style={{
              fontSize: 12,
              marginLeft: 15,
              background: 'white',
              padding: 2,
            }}
          >
            {dateToString(new Date(selectedDate2))}
          </div>
        )}
      </TimeRuler>
      <Bars
        title="Total trips"
        width={width}
        height={h}
        color="#30b190"
        data={tripsByDateFetch.value}
        accessor={d => d.trips}
      />
      <Bars
        title="Mean duration"
        width={width}
        height={h}
        color="#30b190"
        // color={schemeDark2[5]}
        data={avgDurationFetch.value}
        accessor={d => d.trips}
      />
      <Bars
        title="Max temp"
        width={width}
        height={h}
        // color="#30b190"
        // color="#c0a120"
        color={schemeDark2[5]}
        data={weatherFetch.value}
        accessor={d => d.maxTemp}
      />
      <Bars
        title="Precipitation"
        width={width}
        height={h}
        // color="#30b190"
        color="steelblue"
        data={weatherFetch.value}
        accessor={d => d.precipitation}
      />
      {/*<Bars*/}
      {/*  title="Total trips (male)"*/}
      {/*  width={width}*/}
      {/*  height={h}*/}
      {/*  color="#20a1c0"*/}
      {/*  data={tripsByDateGender1Fetch.value}*/}
      {/*  accessor={d => d.trips}*/}
      {/*/>*/}
      {/*<Bars*/}
      {/*  title="Total trips (female)"*/}
      {/*  width={width}*/}
      {/*  height={h}*/}
      {/*  color="#f12010"*/}
      {/*  data={tripsByDateGender2Fetch.value}*/}
      {/*  accessor={d => d.trips}*/}
      {/*/>*/}

    </Outer>
  )
}

const enhance = compose(
  tsvConnector(
    ([
      date,
      precipitation,
      avgTemp,
      maxTemp,
      minTemp,
    ]) => {
      return {
        date: new Date(date),
        precipitation: +precipitation,
        avgTemp: +avgTemp,
        maxTemp: +maxTemp,
        minTemp: +minTemp,
      }
    },
    {
      separator: ','
    }
  )(({ datasetName, filters, bucketings }) => ({
    weatherFetch: {
      url: `/${datasetName}/api/weather`,
      method: 'GET',
    }
  })),
  tsvConnector(
    ([ date, trips ]) => ({
      date: new Date(date),
      trips: +trips,
    })
  )(({ datasetName, filters, bucketings }) => ({
    tripsByDateFetch: {
      url: `/${datasetName}/api/trips-by-date`,
      method: 'POST',
      body: JSON.stringify({
        filters: {
          ...filters,
        },
      }),
      refreshing: true,
    },
    tripsByDateGender1Fetch: {
      url: `/${datasetName}/api/trips-by-date`,
      method: 'POST',
      body: JSON.stringify({
        filters: {
          ...filters,
          gender: 1,
        },
      }),
      refreshing: true,
    },
    tripsByDateGender2Fetch: {
      url: `/${datasetName}/api/trips-by-date`,
      method: 'POST',
      body: JSON.stringify({
        filters: {
          ...filters,
          gender: 2,
        },
      }),
      refreshing: true,
    },
    avgDurationFetch: {
      url: `/${datasetName}/api/avg-duration-by-date`,
      method: 'POST',
      body: JSON.stringify({
        filters: {
          ...filters,
        },
      }),
      refreshing: true,
    },
  })),
  withDimensions(),
)

export default enhance(WeatherChart)
