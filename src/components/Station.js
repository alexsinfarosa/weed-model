import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Box } from "rebass";
import { Select } from "antd";

@inject("store")
@observer
export default class Station extends Component {
  handleChange = value => {
    const {
      setStation,
      closeSidebar,
      loadGridData,
      setIsTable
    } = this.props.store.app;
    setStation(value);
    loadGridData();
    setIsTable(true);
    closeSidebar();
  };
  render() {
    const { currentStateStations, station } = this.props.store.app;

    const stationList = currentStateStations.map(station => (
      <Select.Option
        key={`${station.id} ${station.network}`}
        value={station.name}
      >
        {station.name}
      </Select.Option>
    ));

    return (
      <Box mb={3}>
        <label>Station:</label>
        <Select
          name="station"
          size="large"
          value={station.name}
          placeholder={`Select Station (${currentStateStations.length})`}
          style={{ width: 200 }}
          onChange={this.handleChange}
        >
          {stationList}
        </Select>
      </Box>
    );
  }
}
