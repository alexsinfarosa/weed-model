import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Map as LMap, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { matchIconsToStations } from "utils";

import { Modal } from "antd";

// rebass
import { Flex, Box } from "rebass";

const myIcon = e =>
  L.icon({
    iconUrl: e
  });

@inject("store")
@observer
export default class USMap extends Component {
  state = {
    visible: false,
    selectedState: ""
  };

  handleOkCancel = d => {
    this.setState({ visible: false, selectedState: "" });
  };

  onClickSetStation = e => {
    const { lat, lng } = e.latlng;

    const {
      stations,
      state,
      states,
      setStation,
      loadGridData,
      setState,
      setIsMap
    } = this.props.store.app;

    const selectedStation = stations.find(
      station => station.lat === lat && station.lon === lng
    );

    const selectedState = states.find(
      state => state.postalCode === selectedStation.state
    );

    if (state.name === "All States") {
      setState(selectedState.name);
      setStation(selectedStation.name);
      loadGridData();
      setIsMap(false);
    } else if (selectedStation.state === state.postalCode) {
      setStation(selectedStation.name);
      loadGridData();
      setIsMap(false);
    } else {
      this.setState({ visible: true, selectedState: selectedState.name });
    }
  };

  render() {
    const { state, protocol, stations } = this.props.store.app;

    const stationsWithMatchedIcons = stations.map(station => {
      station["icon"] = matchIconsToStations(protocol, station, state);
      return station;
    });

    // Marker list
    const MarkerList = stationsWithMatchedIcons.map(station => (
      <Marker
        key={`${station.id} ${station.network}`}
        position={[station.lat, station.lon]}
        icon={myIcon(station.icon)}
        title={station.name}
        onClick={this.onClickSetStation}
      />
    ));

    return (
      <Flex bg="white" p={1} mb={[1, 2, 3]} style={{ borderRadius: "5px" }}>
        <Box style={{ width: "100%", height: "35vh" }}>
          <LMap
            style={{ width: "100%", height: "35vh" }}
            zoomControl={true}
            scrollWheelZoom={false}
            ref="map"
            center={
              Object.keys(state).length === 0
                ? [42.9543, -75.5262]
                : [state.lat, state.lon]
            }
            zoom={Object.keys(state).length === 0 ? 6 : state.zoom}
          >
            <TileLayer
              url={`${protocol}//server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}`}
            />
            {MarkerList}
          </LMap>

          <Modal
            // title="Basic Modal"
            visible={this.state.visible}
            onOk={this.handleOkCancel}
            onCancel={this.handleOkCancel}
          >
            <p>{`Select ${this.state
              .selectedState} from the State menu to access this station.`}</p>
          </Modal>
        </Box>
      </Flex>
    );
  }
}
