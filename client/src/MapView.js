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
import { findDOMNode } from 'react-dom'
import FlowMap from './components/FlowMap'
import MapGL, { NavigationControl } from 'react-map-gl'
import geoViewport from '@mapbox/geo-viewport'
import styled from 'react-emotion'
import { Position } from '@blueprintjs/core'
import { getViewportForFeature } from './util/geo'
import * as topojson from 'topojson-client'
import { geoCentroid } from 'd3-geo'
import { FLOW_MAP_COLORS } from './globals'
import { LocationTotalsLegend } from '@flowmap.gl/react'
import Box from './components/Box'
import withDimensions from './util/withDimensions'
import Tooltip from './components/Tooltip'

const MAPBOX_TOKEN = process.env.REACT_APP_MapboxAccessToken

const Outer = styled('div')({
  position: 'absolute',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
})

export const Legend = styled('div')(({ top, bottom, left, right }) => ({
  position: 'absolute',
  top, bottom, left, right,
}))

const getInitialViewState = (bbox) => {
  const { center: [longitude, latitude], zoom } =
    geoViewport.viewport(
      bbox,
      [window.innerWidth, window.innerHeight],
      undefined, undefined, 512
    )
  return {
    longitude,
    latitude,
    zoom,
    bearing: 0,
    pitch: 0,
  }
}

class MapView extends React.Component {
  state = {
    viewport: getInitialViewState([ -180, -70, 180, 70 ]),
    tooltip: null,
    locationAreas: null,
  }

  componentDidMount() {
    const { datasetName } = this.props
    fetch(`/${datasetName}/api/geo/locations`)
      .then(response => response.json())
      .then(json => {
        const { width, height } = this.props
        const locations = (json.type === 'Topology' ?
          topojson.feature(json, json.objects.zones) : json
        )
        locations.features.forEach(f => f.properties.centroid = geoCentroid(f))
        const viewport = getViewportForFeature(locations, width, height, { pad: 0.05 })
        this.setState({
          locationAreas: locations,
          viewport: viewport,
        })
      })
      .catch(err => console.error(err))
  }

  handleUpdateTooltip = (tooltip) => {
    if (!tooltip) {
      this.setState({
        tooltip: null
      })
    } else {
      const { x, y, content } = tooltip
      const node = findDOMNode(this)
      const { top, left, width, height } = node.getBoundingClientRect()
      this.setState({
        tooltip: {
          target: {
            left: x + left,
            top: y + top,
            width,
            height,
          },
          placement: 'top',
          content,
        }
      })
    }
  }


  handleChangeViewport = (viewport) => {
    this.setState({
      viewport,
      tooltip: null,
    })
  }

  render() {
    const {
      width,
      height,
      filters,
      selectedLocations,
      bucketings,
      datasetName,
      onSelectLocation,
    } = this.props
    const { viewport, tooltip, locationAreas } = this.state
    return (
      <Outer>
        <MapGL
          mapboxApiAccessToken={MAPBOX_TOKEN}
          dragRotate={false}
          touchZoom={false}
          touchRotate={false}
          doubleClickZoom={false}
          minPitch={0}
          maxPitch={0}
          {...{
            ...viewport,
            width, height,
          }}
          onViewportChange={this.handleChangeViewport}
        >
          <FlowMap
            width={width}
            height={height}
            viewport={viewport}
            datasetName={datasetName}
            filters={filters}
            bucketings={bucketings}
            selectedLocations={selectedLocations}
            locations={locationAreas}
            onUpdateTooltip={this.handleUpdateTooltip}
            onSelectLocation={onSelectLocation}
          />
          <Legend top={10} right={10}>
            <NavigationControl
              showCompass={false}
              onViewportChange={this.handleChangeViewport}
            />
          </Legend>
          <Box bottom={40} left={10}>
            <LocationTotalsLegend colors={FLOW_MAP_COLORS} />
          </Box>
        </MapGL>
        {tooltip &&
          <div>
          <Tooltip
            {...tooltip}
            position={Position.TOP}
          />
          </div>
          }
      </Outer>
    )
  }
}
export default withDimensions()(MapView)
