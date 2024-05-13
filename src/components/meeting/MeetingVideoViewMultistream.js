import React, { useEffect, useRef, useState } from "react";
import { useMeeting } from "../meetingcontext/MeetingContext";
import VideoElement from "./VideoElement";
import { MEETING_STATUSES } from "../../constants/meeting";
import Isotope from "isotope-layout";
import RemoteVideoOverlay from "./RemoteVideoOverlay";
import ShareElement from "./ShareElement";

const MeetingVideoViewMultistream = () => {
  const contextState = useMeeting();
  const isoRef = useRef("multistreamPanel");
  const isotope = useRef();
  const [videoHeight, setVideoHeight] = useState(
    contextState.viewPort.video.height
  );
  const [shareHeight, setShareHeight] = useState(
    contextState.viewPort.share.height
  );
  const [isoNumrows, setIsoNumrows] = useState(1);
  const [shareStream, setShareStream] = useState(null);

  useEffect(() => {
    console.warn("Multistream video updated: ", contextState.multistreamVideo);
    rearrangeIsotope();
  }, [contextState.multistreamVideo]); //eslint-disable-line react-hooks/exhaustive-deps

  //eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isotope.current) {
      rearrangeIsotope();
    } else {
      console.log("Initializing isotope");
      const iso = new Isotope(isoRef.current, {
        // itemSelector: ".grid-item",
        // percentPosition: true,
        // masonry: {
        //   columnWidth: 120,
        // },
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

  const rearrangeIsotope = () => {
    if (isotope.current) {
      console.log("Rearranging isotope items");
      isotope.current.reloadItems();
      isotope.current.layout();
      isotope.current.arrange();
    }
  };

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

  useEffect(() => {
    const newHeight = Math.floor(
      contextState.viewPort.video.height / (isoNumrows || 1)
    );
    console.log("Video height changed: ", newHeight);
    setVideoHeight(newHeight);
  }, [isoNumrows, contextState.viewPort.video.height]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log("Video height changed: ", videoHeight, ", rearranging isotope");
    rearrangeIsotope();
  }, [videoHeight]); //eslint-disable-line react-hooks/exhaustive-deps

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

  useEffect(() => {
    console.log(
      `Share height changed to: ${contextState.viewPort.share.height}`
    );
    setShareHeight(contextState.viewPort.share.height);
  }, [contextState.viewPort.share.height]); //eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <RemoteVideoOverlay className="remote-video-overlay" />
      <div
        id="multistreamPanel"
        ref={isoRef}
        height={contextState.viewPort.video.height}
        width={contextState.viewPort.video.width}
      >
        {contextState.meetingStatus === MEETING_STATUSES.IN_MEETING &&
        contextState.multistreamVideo ? (
          Object.values(
            // the main video streams may not be active when remote sharing, thumbnails should be used instead
            contextState.isRemoteShareActive
              ? contextState.multistreamVideo?.thumbnails || [] // thumbnails may not be initialized at the meeting join time
              : contextState.multistreamVideo?.main || []
          ).map((videoPane, index) =>
            videoPane?.isActive && videoPane?.isLive ? (
              <VideoElement
                key={index}
                videoPane={videoPane}
                maxHeight={videoHeight}
                width={contextState.viewPort.video.width}
                onAspectRatioChange={rearrangeIsotope}
              />
            ) : (
              <></>
            )
          )
        ) : (
          <></>
        )}
        {contextState.meetingStatus === MEETING_STATUSES.IN_MEETING &&
        contextState.multistreamVideo?.self ? (
          Object.values(contextState.multistreamVideo.self).map(
            (videoPane, index) =>
              videoPane?.isLive ? (
                <VideoElement
                  key="self"
                  videoPane={videoPane}
                  maxHeight={videoHeight}
                  width={contextState.viewPort.video.width}
                  onAspectRatioChange={rearrangeIsotope}
                />
              ) : (
                <></>
              )
          )
        ) : (
          <></>
        )}
      </div>
      {contextState.meetingStatus !== MEETING_STATUSES.INACTIVE &&
        contextState.meetingStatus !== MEETING_STATUSES.JOINING &&
        contextState.isRemoteShareActive && (
          <ShareElement
            key="share"
            stream={shareStream}
            width={contextState.viewPort.share.width}
            height={shareHeight}
          />
        )}
    </div>
  );
};

export default MeetingVideoViewMultistream;
