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
import { Popper } from 'react-popper'
import styled from '@emotion/styled'

class VirtualReference {
  constructor(target) {
    this.target = target
  }
  getBoundingClientRect() {
    const { left, top, width, height } = this.target
    return {
      top,
      left,
      bottom: top + height,
      right: left + width,
      width,
      height,
    }
  }
  get clientWidth() {
    return this.target.width
  }
  get clientHeight() {
    return this.target.height
  }
}

const ContentWrapper = styled('div')({
  pointerEvents: 'none',
  background: '#224455',
  color: '#fff',
  borderRadius: '5px',
  padding: 7,
})

const Tooltip = ({ target, content, placement }) => (
  <Popper placement={placement} referenceElement={new VirtualReference(target)}>
    {({ ref, style, placement, arrowProps }) => (
      <ContentWrapper ref={ref} style={style} data-placement={placement}>
          { content }
        <div ref={arrowProps.ref} style={arrowProps.style} />
      </ContentWrapper>
    )}
  </Popper>
)

export default Tooltip
