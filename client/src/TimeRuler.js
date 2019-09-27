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

import React, { PureComponent } from 'react'
import { findDOMNode } from 'react-dom'
import * as d3scale from 'd3-scale'
import Ruler from './Ruler'

const RULER_WIDTH = 12

const defaultMargin = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}


const hasChanged = (value, nextValue) =>
  nextValue !== value ||
  (nextValue && value && nextValue.getTime() !== value.getTime())

class TimeRuler extends PureComponent {
  props
  static defaultProps = {
    margin: defaultMargin,
  }

  constructor(props) {
    super(props)
    this.state = { internalValue: props.value }
  }

  getTimeScale() {
    const {
      from,
      to,
      width,
      margin = TimeRuler.defaultProps.margin,
    } = this.props
    return d3scale
      .scaleTime()
      .domain([from, to])
      .range([margin.left, margin.left + (width - margin.left - margin.right)])
      .clamp(true)
  }

  getValueFromPosition(evt) {
    // const { withRounding } = this.props
    // const timeScale = this.getTimeScale()
    // const { left } = TooltipHelpers.mousePosition(evt, findDOMNode(this))
    // let nextValue = timeScale.invert(left)
    // if (withRounding) {
    //   nextValue = withRounding(nextValue)
    // }
    // return nextValue
    return null
  }

  componentWillReceiveProps(nextProps) {
    const { value } = this.props
    const nextValue = nextProps.value
    if (hasChanged(value, nextValue)) {
      this.setState({ internalValue: nextValue })
    }
  }

  handleClick = (evt) => {
    const { value, onChange } = this.props
    const nextValue = this.getValueFromPosition(evt)
    if (hasChanged(value, nextValue)) {
      onChange && onChange(nextValue)
    }
  }

  handleMouseMove = (evt) => {
    this.setState({ internalValue: this.getValueFromPosition(evt) })
  }

  handleMouseOut = () => {
    this.setState((state, props) => {
      const { internalValue } = state
      const { value } = props
      if (hasChanged(internalValue, value)) {
        return {
          ...state,
          internalValue: value,
        }
      }
      return state
    })
  }

  renderRuler(value, isInternal) {
    const {
      height,
      children: renderer,
      margin = TimeRuler.defaultProps.margin,
      theme = {},
    } = this.props
    const timeScale = this.getTimeScale()
    return (
      <div
        {...(isInternal ? {
                opacity: 0.5,
        } : null)}
        style={{
              position: 'absolute',
              cursor: 'ew-resize',
              pointerEvents: 'none',
          height: height - margin.top - margin.bottom,
          top: margin.top,
          left: timeScale(value) - RULER_WIDTH / 2,
        }}
      >
        <div style={{ position: 'absolute' }}>
          <Ruler
            width={RULER_WIDTH}
            height={height - margin.top - margin.bottom}
            color={'#ccc'}
          />
        </div>
        {renderer && renderer(value, timeScale)}
      </div>
    )
  }

  render() {
    const { width, height, value } = this.props
    const { internalValue } = this.state
    return (
      <div
        style={
          {
            width, height,
              position: 'absolute',
              overflow: 'visible',
            }}
        onMouseMove={this.handleMouseMove}
        onMouseOut={this.handleMouseOut}
        onClick={this.handleClick}
      >
        {this.renderRuler(value, false)}
        {hasChanged(internalValue, value) &&
          this.renderRuler(internalValue, true)}
      </div>
    )
  }
}

export default TimeRuler
