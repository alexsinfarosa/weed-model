import React, { Component } from "react";
import { inject, observer } from "mobx-react";
// import { toJS } from "mobx";
import "./index.css";
import { Flex, Box, BlockLink } from "rebass";
import { MenuFold } from "./styles";
import { MatchMediaProvider } from "mobx-react-matchmedia";
import { Layout } from "antd";

import State from "components/State";
import Station from "components/Station";
import DatePicker from "components/DatePicker";
import Acknowledgements from "components/Acknowledgements";

import ClickMapMessage from "components/ClickMapMessage";
import USMap from "components/USMap";
import UserTable from "components/UserTable";
import PCEtable from "components/PCEtable";
import ToggleButtons from "components/ToggleButtons";
import PCEgraph from "components/PCEgraph";

const { Content, Footer, Sider } = Layout;

@inject("store")
@observer
class App extends Component {
  render() {
    const {
      isSidebarCollapsed,
      toggleSidebar,
      setSidebar,
      breakpoints,
      viewMap,
      viewTable,
      isGraph,
      isUserTable,
      state,
      station,
      graphData,
      isLoading
    } = this.props.store.app;

    return (
      <MatchMediaProvider breakpoints={breakpoints}>
        <Layout>
          <Sider
            style={{ background: "white", minHeight: "100vh" }}
            trigger={null}
            breakpoint="sm"
            width={250}
            collapsedWidth="0"
            onCollapse={collapsed => {
              setSidebar(collapsed);
            }}
            collapsed={isSidebarCollapsed}
          >
            <Flex py={12} px={16}>
              <Box m="auto">
                <BlockLink
                  f={[1, 2, 2]}
                  style={{ color: "#A42D25" }}
                  href="https://www.cornell.edu/"
                  children="Cornell University"
                />
              </Box>
            </Flex>

            <Flex column py={12} px={16}>
              <State />
              <Station />
              <DatePicker />
              <ToggleButtons />
              <Acknowledgements />
            </Flex>
          </Sider>

          <Layout>
            <Flex
              bg="#3B8456"
              color="white"
              py={12}
              px={16}
              align="center"
              justify="space-between"
            >
              <Flex align="center">
                <MenuFold
                  type={isSidebarCollapsed ? "menu-unfold" : "menu-fold"}
                  onClick={toggleSidebar}
                />
                <Box f={[1, 2, 2]}>Weed Model</Box>
              </Flex>

              <Flex>
                <Box f={[1, 2, 2]}>NEWA</Box>
              </Flex>
            </Flex>

            <Content style={{ margin: "24px 16px" }}>
              <Flex column style={{ maxWidth: "1024px", margin: "0 auto" }}>
                <ClickMapMessage state={state} />
                {viewMap && <USMap />}
                {isUserTable && <UserTable />}
                {isGraph && (
                  <PCEgraph
                    graphData={graphData}
                    state={state}
                    station={station}
                    bpxs={breakpoints.xs}
                  />
                )}
                {viewTable && !isLoading && <PCEtable bpxs={breakpoints.xs} />}
              </Flex>
            </Content>

            <Footer />
          </Layout>
        </Layout>
      </MatchMediaProvider>
    );
  }
}

export default App;
