import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { useMeeting } from "../meetingcontext/MeetingContext";
import VideoElement from "./VideoElement";
import { MEETING_STATUSES } from "../../constants/meeting";
import Isotope from "isotope-layout";
import RemoteVideoOverlay from "./RemoteVideoOverlay";
import ShareElement from "./ShareElement";
// import { Paper } from "@mui/material";
// import Draggable from "react-draggable";
import { setSelfViewPosition } from "../../redux/actions/viewActions";
import SelfView from "./SelfView";

const MeetingVideoViewMultistream = ({ selfView, setSelfViewPosition }) => {
  const contextState = useMeeting();
  const isoRef = useRef("multistreamPanel");
  const isotope = useRef();
  const [videoHeight, setVideoHeight] = useState(
    contextState.viewPort.video.height
  );
  const [isoNumrows, setIsoNumrows] = useState(1);
  const [shareStream, setShareStream] = useState(null);

  /**
   * Rearrange videos on the screen if there is a change in the multistream video - added/removed streams, re-created streams, etc.
   */
  useEffect(() => {
    console.warn("Multistream video updated: ", contextState.multistreamVideo);
    // rearrangeIsotope();
  }, [contextState.multistreamVideo]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log("Children updated");
  }, [isoRef.children]); //eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Setup the isotope layout or update it when the screen dimensions change.
   */
  useEffect(() => {
    if (isotope.current) {
      rearrangeIsotope();
    } else {
      console.log("Initializing isotope");
      const iso = new Isotope(isoRef.current, {
        itemSelector: ".grid-item",
        transitionDuration: 0,
        percentPosition: true,
        masonry: {
          columnWidth: 20,
        },
      });
      iso.on("arrangeComplete", (filteredItems) => {
        if (filteredItems.length === 0) {
          return;
        }
        console.log(
          `Isotope rearranged, view size: ${isotope.current.size.width} x ${isotope.current.size.height}, items: ${filteredItems.length}`
        );
        const isoHeight = isotope.current.size.height;
        if (isoHeight > contextState.viewPort.video.height) {
          console.log(
            `Isotope height: ${isoHeight} exceeded view port size (${
              contextState.viewPort.video.height
            }), increasing number of rows to ${isoNumrows + 1}`
          );

          setIsoNumrows(isoNumrows + 1);
        }
      });
      isotope.current = iso;
    }
  }, [contextState.viewPort]); //eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Rearrange isotope items on the screen
   */
  const rearrangeIsotope = () => {
    if (isotope.current) {
      console.log("Rearranging isotope items");
      isotope.current.reloadItems();
      isotope.current.layout();
      isotope.current.arrange();
    }
  };

  /**
   * We rely on isotope to arrange the video elements on the screen. Unfortunately the video element dimensions
   * cannot be set in percentage because it would result in 0 height. Thus isotope cannot adjust the dimensions
   * automatically. Instead we have to check for isotope to grow beyond the screen size and then we have to adjust
   * number of rows to which the video elements are arranged. Number of rows then determines the height of each video element.
   */
  useEffect(
    () => {
      if (
        isoNumrows > 1 &&
        (isoNumrows - 1) * videoHeight < contextState.viewPort.video.height
      ) {
        console.log("Reducing number of rows to: ", isoNumrows - 1);
        setIsoNumrows(isoNumrows - 1);
      }
      console.log(
        `Accommodate video & container dimensions to: ${contextState.viewPort.video.width} x ${contextState.viewPort.video.height}, number of rows: ${isoNumrows}`
      );
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [
      contextState.viewPort.video.height,
      contextState.viewPort.video.width,
      isoNumrows,
    ]
  );

  /**
   * Update height of the video elements.
   */
  useEffect(() => {
    const newHeight = Math.floor(
      contextState.viewPort.video.height / (isoNumrows || 1)
    );
    console.log("Video height changed: ", newHeight);
    setVideoHeight(newHeight);
  }, [isoNumrows, contextState.viewPort.video.height]); //eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Make sure isotope arranges the video elements on the screen after video height has been updated.
   */
  useEffect(() => {
    console.log("Video height changed: ", videoHeight, ", rearranging isotope");
    rearrangeIsotope();
  }, [videoHeight]); //eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Set remote share stream to the ShareElement.
   */
  useEffect(() => {
    if (
      contextState.isRemoteShareActive &&
      contextState.multistreamVideo?.share
    ) {
      console.log(
        "Remote share is active, the video thumbnails will be rearranged, setting the number of rows to 1"
      );
      setIsoNumrows(1);
      Object.values(contextState.multistreamVideo.share).forEach(
        (videoPane) => {
          console.log("Setting remote share stream");
          setShareStream(videoPane.stream);
        }
      );
    }
  }, [contextState.isRemoteShareActive, contextState.multistreamVideo?.share]);

  return (
    <div position="relative" display="flex">
      {/* Video elements arranged by isotope */}
      <div
        id="multistreamPanel"
        position="relative"
        // justifyContent="flex-start"
        ref={isoRef}
        height={contextState.viewPort.video.height}
        width={contextState.viewPort.video.width}
      >
        {/* Participant videos */}
        {contextState.meetingStatus === MEETING_STATUSES.IN_MEETING &&
        contextState.multistreamVideo
          ? Object.values(
              // the main video streams may not be active when remote sharing, thumbnails should be used instead
              contextState.isRemoteShareActive
                ? contextState.multistreamVideo?.thumbnails || [] // thumbnails may not be initialized at the meeting join time
                : contextState.multistreamVideo?.main || []
            ).map((videoPane, index) =>
              videoPane?.isActive && videoPane?.isLive ? (
                <VideoElement
                  key={videoPane.paneId}
                  videoPane={videoPane}
                  maxHeight={videoHeight}
                  width={contextState.viewPort.video.width}
                  onAspectRatioChange={rearrangeIsotope}
                />
              ) : null
            )
          : null}
      </div>
      {/* Screen share */}
      {contextState.meetingStatus !== MEETING_STATUSES.INACTIVE &&
        contextState.meetingStatus !== MEETING_STATUSES.JOINING &&
        contextState.isRemoteShareActive && (
          <ShareElement
            key="share"
            stream={shareStream}
            width={contextState.viewPort.share.width}
            height={contextState.viewPort.share.height}
          />
        )}
      {/* Selfview */}
      {contextState.meetingStatus === MEETING_STATUSES.IN_MEETING &&
        contextState.selfVideoPane && (
          <SelfView selfVideoPane={contextState.selfVideoPane} />
        )}
      {/* Messages on the screen */}
      <RemoteVideoOverlay />
    </div>
  );
};

MeetingVideoViewMultistream.propTypes = {
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MeetingVideoViewMultistream);
