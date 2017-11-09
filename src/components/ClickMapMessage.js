import React from "react";
import { Box } from "rebass";

const ClickMapMessage = state => {
  if (state.state.name === "All States") {
    return (
      <Box mb={3} f={[0, 1, 2]}>
        Click one of the icons on the map or select a state and a station from
        the left panel.
      </Box>
    );
  }
  return null;
};

export default ClickMapMessage;
