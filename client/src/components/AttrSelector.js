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
import { Button, Position, Popover } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import styled from 'react-emotion'
import { css } from 'emotion'
import { Tag } from '@blueprintjs/core'
import * as R from 'ramda'

const Content = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: 20,
  maxHeight: '30rem',
  overflow: 'auto',
  '& > * + *': {
    marginTop: 7,
  },
})

const tagStyle = css({
  '&:focus': {
    outline: 'none !important',
  },
})

export default class AttrSelector extends React.Component {

  state = {
    isOpen: false,
  }

  handleInteraction = (isOpen) => this.setState({ isOpen })
  handleSelect = (attrName) => {
    this.handleInteraction(false)
    const { onSelectAttr } = this.props
    onSelectAttr(attrName)
  }

  render() {
    const { isOpen } = this.state
    const { attributes, selectedAttrs } = this.props
    return (
      <Popover
        isOpen={isOpen}
        onInteraction={this.handleInteraction}
        position={Position.BOTTOM_LEFT}
        content={
          <Content>
            {attributes
              .filter(({ name }) => !R.contains(name, selectedAttrs))
              .map(({ name, label }) => (
                <Tag
                  large
                  key={name}
                  onClose={this.handleClose}
                  interactive={true}
                  className={tagStyle}
                  onClick={() => this.handleSelect(name)}
                >
                  {label || name}
                </Tag>
              ))
            }
          </Content>
        }
        target={
          <Button
            icon={IconNames.PLUS}
          >
            Add attributes
          </Button>
        }
      />
    )
  }
}
