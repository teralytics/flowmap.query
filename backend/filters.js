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

const R = require('ramda')
const { escape, escapeId } = require('sqlstring')

const isValidAttr = (attr) => /^[\w_\-]+$/.test(attr)
const isValidAttrValue = (attr) => /^[^"]+$/.test(attr)

const isValidAttrFilter = (filters) => {
  if (filters == null) return true
  for (const attrName of Object.keys(filters)) {
    if (!isValidAttr(attrName) || !isValidAttrValue(filters[ attrName ])) {
      return false
    }
  }
  return true
}

const findAttribute = (attributes, attrName) =>
  attributes.find(attr => attr.name === attrName)

const getFiltersQueryCondition = (filters, attributes) => {
  if (filters) {
    return R.pipe(
      R.toPairs(),
      R.map(([ attrName, v ]) => {
        const attr = findAttribute(attributes, attrName)
        switch (attr.type) {
          case 'numeric': {
            return `${attr.expression || escapeId(attrName)}=${escape(+v)}`
          }
          default:
            return `${attr.expression || escapeId(attrName)}=${escape(v)}`
        }
      })
    )(filters).join(' AND ')
  }
  return ''
}

module.exports = {
  getFiltersQueryCondition,
  isValidAttr,
  isValidAttrFilter,
  findAttribute,
}
