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


const Ruler = ({ width, height, color = '#000' }) => {
  const m = ~~(width / 2)
  const w = ~~(width * 0.65)
  return (
    <svg width={width} height={height}>
      <g transform={`translate(${m},0)`}>
        <line y1={0} y2={height} stroke={color} />
        <path
          d={`M${0},${w} L${-m},0 L${+m},0 L${0},${w}`}
          fill={color}
          stroke="none"
        />
        <path
          d={`M${0},${height -
            w} L${-m},${height} L${+m},${height} L${0},${height - w}`}
          fill={color}
          stroke="none"
        />
      </g>
    </svg>
  )
}

export default Ruler
