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

import FlowMapLayer from '@flowmap.gl/core'
import React from 'react'
import { DeckGL } from '@deck.gl/react'
import debounce from 'lodash/debounce'
import tsvConnector from '../util/tsvConnector'
import SpinnerBox from './SpinnerBox'
import WebMercatorViewport from 'viewport-mercator-project'
import { Callout } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as R from 'ramda'
import LocationTooltip from './LocationTooltip'
import FlowTooltip from './FlowTooltip'
import {
  FLOW_MAP_COLORS,
  getFlowDestId,
  getFlowMagnitude,
  getFlowOriginId,
  getLocationCentroid,
  getLocationId
} from '../globals'
import { Legend } from '../MapView'

const EMPTY = []


class FlowMap extends React.Component {

  state = {
    highlightedLocationId: null,
    highlightedFlow: null,
    flows: EMPTY,
  }

  getMercator() {
    const { width, height, viewport } = this.props
    return new WebMercatorViewport({
      width,
      height,
      ...viewport,
    })
  }

  highlight = ({ highlightedLocationId, highlightedFlow }) => {
    this.setState({
      highlightedLocationId,
      highlightedFlow,
    })
    this.highlightDebounced.cancel()
  }

  highlightDebounced = debounce(this.highlight, 100)

  handleFlowMapHover = ({ type, object, x, y }) => {
    const { onUpdateTooltip } = this.props
    switch (type) {
      case 'flow': {
        if (object) {
          onUpdateTooltip({
            x, y,
            content: <FlowTooltip flow={object} />
          })
        } else {
          onUpdateTooltip(null)
        }
        this.highlight({
          highlightedFlow: object,
          highlightedLocationId: null,
        })
        break
      }

      case 'location': {
        if (object) {
          const [x1, y1] = this.getMercator().project(getLocationCentroid(object))
          onUpdateTooltip({
            x: x1, y: y1,
            content: <LocationTooltip location={object} />
          })
        } else {
          onUpdateTooltip(null)
        }
        this.highlight({
          highlightedFlow: null,
          highlightedLocationId: object ? getLocationId(object) : null,
        })
        break
      }

      // case 'location-area':
      //   this.highlightDebounced({
      //     highlightedFlow: null,
      //     highlightedLocationId: object ? getLocationId(object) : null
      //   })
      //   break

      default:
        this.highlightDebounced({
          highlightedFlow: null,
          highlightedLocationId: null,
        })
        onUpdateTooltip(null)
    }
  }

  handleFlowMapClick = ({ type, object }) => {
    switch (type) {
      case 'location':
      case 'location-area':
      {
        const { onSelectLocation } = this.props
        const id = object ? getLocationId(object) : null
        onSelectLocation(id)
        break
      }
      default:
    }
  }

  static getLocationIds(locations) {
    const ids = new Set()
    if (locations) {
      for (const l of locations.features) {
        ids.add(getLocationId(l))
      }
    }
    return ids
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { flowsFetch: { value }, locations } = nextProps
    if (value !== prevState.prevValue) {
      if (value && locations) {
        const ids = FlowMap.getLocationIds(locations)
        const flows = []
        const omitted = []
        for (const f of value) {
          if (ids.has(getFlowOriginId(f)) && ids.has(getFlowDestId(f))) {
            flows.push(f)
          } else {
            omitted.push(`${getFlowOriginId(f)}->${getFlowDestId(f)}`)
          }
        }
        if (omitted.length > 0) {
          console.warn(`Omitting flows`, omitted, ids, flows)
        }
        return { flows, prevValue: value, locations }
      }
    }
    return EMPTY
  }

  render() {
    const {
      flowsFetch,
      locations,
      selectedLocations,
      viewport,
    } = this.props

    const {
      flows,
      highlightedLocationId,
      highlightedFlow,
    } = this.state

    if (!locations) {
      return null
    }
    if (flowsFetch.rejected) {
      return (
        <Legend top={10} left={10}>
          <Callout intent="danger" icon={IconNames.WARNING_SIGN}>
            The flows data could not be loaded.
          </Callout>
        </Legend>
      )
    }

    return (
      <DeckGL
        viewState={viewport}
        style={{ mixBlendMode: 'multiply' }}
      >
        {flowsFetch.pending && <SpinnerBox top={15} left={15} /> }
        {locations && flows && <FlowMapLayer
          {...{
            colors: FLOW_MAP_COLORS,
            locations,
            flows,
            getLocationId,
            getLocationCentroid,
            getFlowOriginId,
            getFlowDestId,
            getFlowMagnitude,
            selectedLocationIds: R.isEmpty(selectedLocations) ? null : selectedLocations,
            highlightedLocationId,
            highlightedFlow,
            showTotals: true,
            showLocationAreas: true,
            varyFlowColorByMagnitude: true,
            onHover: this.handleFlowMapHover,
            onClick: this.handleFlowMapClick,
          }}
        />}
      </DeckGL>
    )
  }
}

export default tsvConnector(
  ([ origin, dest, count ]) => ({
    origin,
    dest,
    count: +count,
  })
)(({ datasetName, filters, bucketings }) => ({
  flowsFetch: {
    url: `/${datasetName}/api/flows`,
    method: 'POST',
    body: JSON.stringify({ filters, bucketings }),
  }
}))(FlowMap)
