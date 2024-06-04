import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { setSelfViewPosition } from "../../redux/actions/viewActions";
import Draggable from "react-draggable";
import { Paper } from "@mui/material";
import VideoElement from "./VideoElement";

const SelfView = ({ selfVideoPane, selfView, setSelfViewPosition }) => {
  let visible = true;
  if (selfView.visible !== undefined) {
    visible = selfView.visible;
  }
  return selfVideoPane && visible ? (
    <Draggable
      position={selfView?.position ? selfView.position : { x: 0, y: 0 }}
      onStart={(e, data) => {
        console.log("Drag started: ", data);
      }}
      onStop={(e, data) => {
        console.log("Drag stopped: ", data);
        setSelfViewPosition({ x: data.x, y: data.y });
      }}
      // onDrag={(e, data) => {
      //   console.log("Dragging: ", data);
      // }}
      // bounds="parent"
    >
      <Paper
        className="selfview" // class is read by Draggable, do not use sx or other locally defined parameters
        elevation={6}
      >
        <VideoElement
          key={selfVideoPane.paneId}
          videoPane={selfVideoPane}
          maxHeight={135}
          width={240}
          padding={0}
          onAspectRatioChange={() => {
            console.log("Selfview changed aspect ratio");
          }}
        />
      </Paper>
    </Draggable>
  ) : (
    <></>
  );
};

SelfView.propTypes = {
  selfVideoPane: PropTypes.object.isRequired,
  selfView: PropTypes.object,
  setSelfViewPosition: PropTypes.func,
};

function mapStateToProps(state) {
  return {
    selfView: state?.view?.selfView || { position: { x: 0, y: 0 } },
  };
}

const mapDispatchToProps = {
  setSelfViewPosition,
};

export default connect(mapStateToProps, mapDispatchToProps)(SelfView);
