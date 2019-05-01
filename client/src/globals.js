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

export const getLocationId = l => l.properties.id
export const getLocationCentroid = l => l.properties.centroid
export const getLocationTotalIn = l => l.properties.totalIn
export const getLocationTotalOut = l => l.properties.totalOut
export const getFlowOriginId = f => f.origin
export const getFlowDestId = f => f.dest
export const getFlowMagnitude = f => f.count
export const FLOW_MAP_COLORS = {
  locationCircles: {
    outgoing: 'white',
  },
  locationAreas: {
    outline: 'rgba(92,112,128,0.5)',
    normal: 'rgba(187,187,187,0.5)',
    selected: 'rgba(217,130,43,0.5)',
  },
}
