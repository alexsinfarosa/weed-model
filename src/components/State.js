import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Box } from "rebass";
import { Select } from "antd";

@inject("store")
@observer
export default class State extends Component {
  handleChange = value => {
    const { setState, closeSidebar } = this.props.store.app;
    setState(value);
    closeSidebar();
  };

  render() {
    const { state, states } = this.props.store.app;

    const stateList = states.map(state => (
      <Select.Option key={state.postalCode} value={state.name}>
        {state.name}
      </Select.Option>
    ));

    return (
      <Box mb={3}>
        <label>State:</label>
        <Select
          name="state"
          size="large"
          value={state.name}
          placeholder="Select State"
          style={{ width: 200 }}
          onChange={this.handleChange}
        >
          {stateList}
        </Select>
      </Box>
    );
  }
}
