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
import styled from '@emotion/styled'
import { Callout, Position } from '@blueprintjs/core'
import { getViewportForFeature } from './util/geo'
import * as topojson from 'topojson-client'
import { geoCentroid } from 'd3-geo'
import { getFlowDestId, getFlowMagnitude, getFlowOriginId, getLocationCentroid, getLocationId } from './globals'
import FlowMap from '@flowmap.gl/react'
import * as Cluster from '@flowmap.gl/cluster'
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

const EMPTY = []

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
      if (locationsFetch.fulfilled) {
        return locationsFetch.value
      }
      return null
    },
    [locationsFetch]
  )
  React.useEffect(() =>
    {
      if (locations && !viewport) {
        const nextViewport = getViewportForFeature(locations, width, height, { pad: 0.05 })
        setState({
          viewport: nextViewport
        })
      }
    },
    [locations, width, height]
  )
  const flows = React.useMemo(
    () => {
      if (flowsFetch.fulfilled) {
        return flowsFetch.value
      }
      return null
    },
    [flowsFetch.value]
  )

  const getLocationWeight = React.useMemo(
    () => {
      if (!flows) return null
      return Cluster.makeLocationWeightGetter(flows, {
        getFlowOriginId,
        getFlowDestId,
        getFlowMagnitude,
      })
    },
    [flows]
  )
  const clusterIndex = React.useMemo(
    () => {
      if (!locations || !locations.features || !getLocationWeight) return null
      const clusterLevels = Cluster.clusterLocations(
        locations.features,
        { getLocationId, getLocationCentroid },
        getLocationWeight, {
        makeClusterName: (id, numPoints) => `Cluster #${id} of ${numPoints} locations`,
      })
      return Cluster.buildIndex(clusterLevels)
    },
    [flows, locations, getLocationWeight]
  )
  const aggregateFlowsByZoom = React.useMemo(
    () => {
      const aggregateFlowsByZoom = new Map()
      if (!clusterIndex) return null
      for (const zoom of clusterIndex.availableZoomLevels) {
        aggregateFlowsByZoom.set(
          zoom,
          clusterIndex.aggregateFlows(flows, zoom, { getFlowOriginId, getFlowDestId, getFlowMagnitude }),
        );
      }
      return aggregateFlowsByZoom
    },
    [flows, clusterIndex]
  )

  const clusterZoom = React.useMemo(
     () => {
       if (!state.viewport) return null
       const { zoom } = state.viewport
       if (!clusterIndex) return null
       return Cluster.findAppropriateZoomLevel(clusterIndex.availableZoomLevels, zoom)
     },
    [clusterIndex, state.viewport]
  )

  const clusteredLocations = React.useMemo(
     () => clusterIndex ? clusterIndex.getClusterNodesFor(clusterZoom) : EMPTY,
    [clusterZoom, clusterIndex]
  )

  const aggregateFlows = React.useMemo(
     () => aggregateFlowsByZoom ? aggregateFlowsByZoom.get(clusterZoom) : EMPTY,
    [clusterZoom, aggregateFlowsByZoom]
  )


  const handleViewStateChange = React.useCallback((viewState) => {
    setState({
      viewport: viewState,
    })
  })

  return (
    <Outer>
      {viewport &&
      <FlowMap
        initialViewState={viewport}
        showTotals={true}
        showLocationAreas={false}
        showOnlyTopFlows={MAX_FLOWS_NUM}
        flows={aggregateFlows}
        locations={clusteredLocations}
        getLocationId={(loc) => loc.id}
        getLocationCentroid={(loc) => loc.centroid}
        getFlowOriginId={(flow) => (Cluster.isAggregateFlow(flow) ? flow.origin : getFlowOriginId(flow))}
        getFlowDestId={(flow) => (Cluster.isAggregateFlow(flow) ? flow.dest : getFlowDestId(flow))}
        getFlowMagnitude={(flow) => (Cluster.isAggregateFlow(flow) ? flow.count : getFlowMagnitude(flow))}
        mapboxAccessToken={MAPBOX_TOKEN}
        onViewStateChange={handleViewStateChange}
        onHighlighted={console.log}
      />
      }
      {(flowsFetch.pending || flowsFetch.refreshing) && <SpinnerBox top={15} left={15} /> }
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
    refreshing: true,
  }
}))(withDimensions()(MapView)))
