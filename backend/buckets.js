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

const findBucketingByName = (attr, attributes, bucketings) => {
  const { bucketings: confBucketings } = attributes.find(({ name }) => name === attr)
  if (confBucketings) {
    return (
      (bucketings && R.has(attr, bucketings) && confBucketings.find(({ name }) => name === bucketings[ attr ])) ||
      R.head(confBucketings)
    )
  }
  return null
}

const getAttrBucketThresholds = (attr, attributes, bucketings) => {
  const bucketing = findBucketingByName(attr, attributes, bucketings)
  if (bucketing) {
    const { buckets } = bucketing
    return buckets
  }
  return null
}

const getBucketName = (i, bucketThresholds) => {
  if (i === 0) return `≤ ${bucketThresholds[ 0 ]}`
  if (i === bucketThresholds.length) return `> ${R.last(bucketThresholds)}`
  return `${bucketThresholds[ i - 1 ]} ‥ ${bucketThresholds[ i ]}`
}

const findBucketIndexByName = (bucketName, attr, bucketThresholds) => {
  for (let i = 0; i <= bucketThresholds.length; i++) {
    if (bucketName === getBucketName(i, bucketThresholds)) return i
  }
  return -1
}

const getBucketConditionQ = (bucketName, attr, attributes, bucketings) => {
  const bucketThresholds = getAttrBucketThresholds(attr, attributes, bucketings)
  const i = findBucketIndexByName(bucketName, attr, bucketThresholds)
  if (i < 0) return null
  if (i === 0) {
    return `${attr} <= ${R.head(bucketThresholds)}`
  }
  if (i === bucketThresholds.length) {
    return `${attr} > ${R.last(bucketThresholds)}`
  }
  return `(${bucketThresholds[ i - 1 ]} < ${attr} AND ${attr} <= ${bucketThresholds[ i ]})`
}

const getBucketsSelectQ = (attr, attributes, bucketings) => {
  const bucketThresholds = getAttrBucketThresholds(attr, attributes, bucketings)
  if (bucketThresholds) {
    return `
      CASE
      ${bucketThresholds.map(
      (v, i) => `WHEN ${escapeId(attr)} <= ${escape(v)} THEN '${getBucketName(i, bucketThresholds)}'`
    ).join('\n')}
      ELSE '${getBucketName(bucketThresholds.length, bucketThresholds)}'
      END
    `
  }
  return attr
}

const getBucketsOrderQ = (attr, attributes, bucketings) => {
  const confBuckets = getAttrBucketThresholds(attr, attributes, bucketings)
  if (confBuckets) {
    return `
      CASE
      ${confBuckets.map(
      (v, i) => `WHEN ${escapeId(attr)} ='${getBucketName(i, confBuckets)}' THEN ${i}`
    ).join('\n')}
      ELSE ${confBuckets.length}
      END DESC
    `
  }
  return `${attr} DESC`
}

module.exports = {
  getBucketsOrderQ,
  getBucketsSelectQ,
  getBucketConditionQ,
}
