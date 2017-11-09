import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import format from "date-fns/format";
import subDays from "date-fns/sub_days";
import addDays from "date-fns/add_days";
import { Flex, Box } from "rebass";
import { Table } from "antd";

import "index.css";

@inject("store")
@observer
export default class PCEtable extends Component {
  render() {
    const {
      station,
      state,
      areRequiredFieldsSet,
      crabgrass,
      gFoxtail,
      yFoxtail,
      lambsquarters,
      pigweed,
      ragweed,
      nightshade,
      velvetleaf,
      endDate
    } = this.props.store.app;

    //columns for the model
    const columns = [
      {
        title: "Species",
        dataIndex: "name",
        key: "name",
        width: 250
      },
      {
        title: `${format(subDays(endDate, 2), "MMMM Do")}`,
        dataIndex: `indexMinus2`,
        key: "indexMinus2",
        width: 250
      },
      {
        title: `${format(endDate, "MMMM Do")}`,
        dataIndex: "index",
        key: "index",
        width: 250
      },
      {
        title: "Forecast (currently not available)",
        dataIndex: "tomorrow",
        key: "tomorrow",
        width: 250
      }
    ];

    // for mobile devices
    const columnsMobile = [
      {
        title: "Species",
        dataIndex: "name",
        key: "name",
        width: "50%"
      },
      {
        title: `${format(subDays(endDate, 2), "MMM D")}`,
        dataIndex: `indexMinus2`,
        key: "indexMinus2",
        width: "17%"
      },
      {
        title: `${format(endDate, "MMM D")}`,
        dataIndex: "index",
        key: "index",
        width: "17%"
      },
      {
        title: `${format(addDays(endDate, 1), "MMM D")}`,
        dataIndex: "tomorrow",
        key: "tomorrow",
        width: "17%"
      }
    ];

    const species = [
      crabgrass,
      gFoxtail,
      yFoxtail,
      lambsquarters,
      pigweed,
      ragweed,
      nightshade,
      velvetleaf
    ];

    const stripeTable = i => {
      if (i % 2 === 1) return "stripe";
    };

    const { bpxs } = this.props;
    return (
      <Flex
        column
        bg="white"
        p={1}
        mb={[1, 2, 3]}
        style={{ borderRadius: "5px" }}
      >
        <Box mb={1} f={[1, 2, 3]}>
          Percent Cumulative Emergence (PCE) for {station.name}, {state.name}
        </Box>
        <Box>
          {species.map((specie, i) => (
            <Table
              key={i}
              showHeader={i === 0 ? true : false}
              size={bpxs ? "middle" : "large"}
              columns={bpxs ? columnsMobile : columns}
              rowKey={record => record}
              loading={this.props.store.app.isLoading}
              pagination={false}
              dataSource={areRequiredFieldsSet ? specie.slice(-1) : null}
              onChange={this.handleChange}
              rowClassName={() => stripeTable(i)} //hack
            />
          ))}
        </Box>
      </Flex>
    );
  }
}
