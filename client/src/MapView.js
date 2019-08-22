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
import FlowMapView from './components/FlowMapView'
import MapGL, { NavigationControl } from 'react-map-gl'
import geoViewport from '@mapbox/geo-viewport'
import styled from '@emotion/styled'
import { Callout, Intent, Position, Spinner } from '@blueprintjs/core'
import { getViewportForFeature } from './util/geo'
import * as topojson from 'topojson-client'
import { geoCentroid } from 'd3-geo'
import {
  FLOW_MAP_COLORS,
  getFlowDestId,
  getFlowMagnitude,
  getFlowOriginId,
  getLocationCentroid,
  getLocationId
} from './globals'
import FlowMap, { LocationTotalsLegend } from '@flowmap.gl/react'
import Box from './components/Box'
import withDimensions from './util/withDimensions'
import Tooltip from './components/Tooltip'
import tsvConnector from './util/tsvConnector'
import SpinnerBox from './components/SpinnerBox'
import { IconNames } from '@blueprintjs/icons'
import { connect } from 'react-refetch'

const MAPBOX_TOKEN = process.env.REACT_APP_MapboxAccessToken
const MAX_FLOWS_NUM = 10000

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

const MapView = ({
    width,
    height,
    filters,
    selectedLocations,
    bucketings,
    datasetName,
    locationsFetch,
    flowsFetch,
    onSelectLocation,
  }) => {
  const [state, setState] = React.useState({
    viewport: undefined, // getInitialViewState([ -180, -70, 180, 70 ]),
    tooltip: null,
  })
  const { viewport, tooltip } = state
  const locations = React.useMemo(
    () => {
      if (!flowsFetch.fulfilled) {
        return []
      }
      if (locationsFetch.fulfilled) {
        const locations = locationsFetch.value
        setState({
          viewport: getViewportForFeature(locations, width, height, { pad: 0.05 })
        })
        return locations
      }
      return []
    },
    [locationsFetch.value, flowsFetch.value]
  )
  const flows = React.useMemo(
    () => {
      if (flowsFetch.fulfilled) {
        return flowsFetch.value
      }
      return []
    },
    [flowsFetch.value]
  )
  // if (!locationAreas) {
  //   return (
  //     <Spinner intent={Intent.PRIMARY} size={15} />
  //   )
  // }
  const handleViewStateChange = React.useCallback(() => {

  })
  return (
    <Outer>
      {viewport &&
      <FlowMap
        initialViewState={viewport}
        showTotals={true}
        showLocationAreas={false}
        showOnlyTopFlows={MAX_FLOWS_NUM}
        flows={flows}
        locations={locations}
        getLocationId={getLocationId}
        getLocationCentroid={getLocationCentroid}
        getFlowOriginId={getFlowOriginId}
        getFlowDestId={getFlowDestId}
        getFlowMagnitude={getFlowMagnitude}
        mapboxAccessToken={MAPBOX_TOKEN}
        onViewStateChange={handleViewStateChange}
        onHighlighted={console.log}
      />
      }
      {flowsFetch.pending && <SpinnerBox top={15} left={15} /> }
      {flowsFetch.rejected &&
      <Legend top={10} left={10}>
        <Callout intent="danger" icon={IconNames.WARNING_SIGN}>
          The flows data could not be loaded.
        </Callout>
      </Legend>
      }
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

// class MapView extends React.Component {
//   state = {
//     viewport: getInitialViewState([ -180, -70, 180, 70 ]),
//     tooltip: null,
//     locationAreas: null,
//     flows: [],
//   }
//
//   componentDidMount() {
//     const { datasetName } = this.props
//     fetch(`/${datasetName}/api/geo/locations`)
//       .then(response => response.json())
//       .then(json => {
//         const { width, height } = this.props
//         const locations = (json.type === 'Topology' ?
//           topojson.feature(json, json.objects.zones) : json
//         )
//         locations.features.forEach(f => f.properties.centroid = geoCentroid(f))
//         const viewport = getViewportForFeature(locations, width, height, { pad: 0.05 })
//         this.setState({
//           locationAreas: locations,
//           viewport: viewport,
//         })
//       })
//       .catch(err => console.error(err))
//   }
//
//   handleUpdateTooltip = (tooltip) => {
//     if (!tooltip) {
//       this.setState({
//         tooltip: null
//       })
//     } else {
//       const { x, y, content } = tooltip
//       const node = findDOMNode(this)
//       const { top, left, width, height } = node.getBoundingClientRect()
//       this.setState({
//         tooltip: {
//           target: {
//             left: x + left,
//             top: y + top,
//             width,
//             height,
//           },
//           placement: 'top',
//           content,
//         }
//       })
//     }
//   }
//
//
//   handleChangeViewport = (viewport) => {
//     this.setState({
//       viewport,
//       tooltip: null,
//     })
//   }
//
//   handleViewStateChange = (viewState) => {
//     const { onViewStateChange } = this.props;
//     if (onViewStateChange) {
//       onViewStateChange(viewState);
//     }
//     const { tooltip } = this.state;
//     if (tooltip) {
//       this.setState({ tooltip: undefined });
//     }
//   }
//
//   static getDerivedStateFromProps(nextProps, prevState) {
//     const { flowsFetch: { value }, locations } = nextProps
//     if (value !== prevState.prevValue) {
//       if (value && locations) {
//         const ids = FlowMapView.getLocationIds(locations)
//         const flows = []
//         const omitted = []
//         for (const f of value) {
//           if (ids.has(getFlowOriginId(f)) && ids.has(getFlowDestId(f))) {
//             flows.push(f)
//           } else {
//             omitted.push(`${getFlowOriginId(f)}->${getFlowDestId(f)}`)
//           }
//         }
//         if (omitted.length > 0) {
//           console.warn(`Omitting flows`, omitted, ids, flows)
//         }
//         return { flows, prevValue: value, locations }
//       }
//     }
//     return {}
//   }
//
//   render() {
//     const {
//       width,
//       height,
//       filters,
//       selectedLocations,
//       bucketings,
//       datasetName,
//       onSelectLocation,
//     } = this.props
//     const { viewport, flows, tooltip, locationAreas } = this.state
//     const {
//       flowsFetch,
//     } = this.props
//     console.log(flows)
//     if (!locationAreas) {
//       return (
//         <Spinner intent={Intent.PRIMARY} size={15} />
//       )
//     }
//     return (
//       <Outer>
//         <FlowMap
//           initialViewState={viewport}
//           showTotals={true}
//           showLocationAreas={false}
//           showOnlyTopFlows={MAX_FLOWS_NUM}
//           flows={flows}
//           locations={locationAreas}
//           getLocationId={getLocationId}
//           getLocationCentroid={getLocationCentroid}
//           getFlowOriginId={getFlowOriginId}
//           getFlowDestId={getFlowDestId}
//           getFlowMagnitude={getFlowMagnitude}
//           mapboxAccessToken={MAPBOX_TOKEN}
//           onViewStateChange={this.handleViewStateChange}
//           onHighlighted={console.log}
//         />
//         {flowsFetch.pending && <SpinnerBox top={15} left={15} /> }
//         {flowsFetch.rejected &&
//           <Legend top={10} left={10}>
//             <Callout intent="danger" icon={IconNames.WARNING_SIGN}>
//               The flows data could not be loaded.
//             </Callout>
//           </Legend>
//         }
//
//
//         {tooltip &&
//           <div>
//           <Tooltip
//             {...tooltip}
//             position={Position.TOP}
//           />
//           </div>
//           }
//       </Outer>
//     )
//   }
// }

//
// <MapGL
//           mapboxApiAccessToken={MAPBOX_TOKEN}
//           dragRotate={false}
//           touchZoom={false}
//           touchRotate={false}
//           doubleClickZoom={false}
//           minPitch={0}
//           maxPitch={0}
//           {...{
//             ...viewport,
//             width, height,
//           }}
//           onViewportChange={this.handleChangeViewport}
//         >
//           <FlowMapView
//             width={width}
//             height={height}
//             viewport={viewport}
//             datasetName={datasetName}
//             filters={filters}
//             bucketings={bucketings}
//             selectedLocations={selectedLocations}
//             locations={locationAreas}
//             onUpdateTooltip={this.handleUpdateTooltip}
//             onSelectLocation={onSelectLocation}
//           />
//           <Legend top={10} right={10}>
//             <NavigationControl
//               showCompass={false}
//               onViewportChange={this.handleChangeViewport}
//             />
//           </Legend>
//           <Box bottom={40} left={10}>
//             <LocationTotalsLegend colors={FLOW_MAP_COLORS} />
//           </Box>
//         </MapGL>

export default connect(({ datasetName }) => ({
   locationsFetch: {
     url: `/${datasetName}/api/geo/locations`,
     then: (json) => {
       const locations = (json.type === 'Topology' ?
         topojson.feature(json, json.objects.zones) : json
       )
       locations.features.forEach(f => f.properties.centroid = geoCentroid(f))
     },
   }
 }))(tsvConnector(
  ([ origin, dest, count ]) => ({
    origin,
    dest,
    count: +count,
  })
)(({ datasetName, filters, bucketings }) => ({
  flowsFetch: {
    url: `/${datasetName}/api/flows`,
    method: 'POST',
    body: JSON.stringify({
      filters,
      bucketings,
      limit: MAX_FLOWS_NUM,
    }),
  }
}))(withDimensions()(MapView)))
