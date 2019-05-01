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

import geoViewport from '@mapbox/geo-viewport'
import { geoBounds } from 'd3-geo'
import * as d3ease from 'd3-ease'
import { FlyToInterpolator } from 'react-map-gl'

const TILE_SIZE = 512

export const getViewportForFeature = (
  feature,
  width,
  height,
  opts,
) => {
  const { pad = 0, tileSize = TILE_SIZE, minZoom = 0, maxZoom = 100 } =
    opts || {}

  const [[x1, y1], [x2, y2]] = geoBounds(feature)
  const bounds = [
    x1 - pad * (x2 - x1),
    y1 - pad * (y2 - y1),
    x2 + pad * (x2 - x1),
    y2 + pad * (y2 - y1),
  ]

  const {
    center: [longitude, latitude],
    zoom,
  } = geoViewport.viewport(
    bounds,
    [width, height],
    undefined,
    undefined,
    tileSize,
    true
  )

  return {
    longitude,
    latitude,
    zoom: Math.max(Math.min(maxZoom, zoom), minZoom),
    transitionDuration: 4000,
    transitionInterpolator: new FlyToInterpolator(),
    transitionEasing: d3ease.easeCubic,
  }
}
