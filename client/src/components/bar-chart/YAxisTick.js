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

import truncate from 'lodash.truncate';
import * as React from 'react';

class YAxisTick extends React.PureComponent {
  render() {
    const { value, textLength = 15 } = this.props;
    const text = truncate(value, { length: textLength });

    return (
      <tspan onMouseEnter={this.handleTextHover} onClick={this.handleTextClick}>
        {text}
      </tspan>
    );
  }

  handleTextClick= e => {
    const { value, onTextClick } = this.props;
    onTextClick(value, e);
  };

  handleTextHover = e => {
    const { value, onTextHover } = this.props;
    onTextHover(value, e);
  };
}

export default YAxisTick;
