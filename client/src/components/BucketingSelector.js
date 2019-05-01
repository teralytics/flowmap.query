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
import * as R from 'ramda'
import { css } from 'emotion'
import { Button, MenuItem } from '@blueprintjs/core'
import { Select } from '@blueprintjs/select'

const BucketingSelector = ({ bucketings, selectedBucketing, onChange }) => {
  return (
    <div className={css({
      display: 'flex',
      alignItems: 'center',
      '& > * + *': {
        marginLeft: 5,
      },
    })}>
      <div>
      Bucket by
      </div>
      <Select
        items={bucketings}
        itemRenderer={({ name, label }, { handleClick, modifiers }) =>
          <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled}
            key={name}
            text={label}
            onClick={handleClick}
          />
        }
        filterable={false}
        popoverProps={{ minimal: true }}
        onItemSelect={onChange}
      >
        <Button
          small
          text={
            (bucketings.find(({ name }) => name === selectedBucketing) || R.head(bucketings)).label
          }
          rightIcon="double-caret-vertical"
        />
      </Select>
    </div>
  )
}

export default BucketingSelector
