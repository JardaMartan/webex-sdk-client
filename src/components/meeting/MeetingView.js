import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Box from "@mui/joy/Box";
import { useMeeting } from "../meetingcontext/MeetingContext";
import { MEETING_STATUSES } from "../../constants/meeting";
import ModalLeaveMeeting from "./ModalLeaveMeeting";
import ModalDtmf from "./ModalDtmf";
import ModalMeetingPassword from "./ModalMeetingPassword";
import ModalMeetingCaptcha from "./ModalMeetingCaptcha";
import MeetingVideoViewNormal from "./MeetingVideoViewNormal";
import MeetingVideoViewMultistream from "./MeetingVideoViewMultistream";

const MeetingView = ({ mediaDevices }) => {
  const remoteAudioRef = useRef("remoteAudio");
  const multistreamRemoteAudioRef0 = useRef("multistreamRemoteAudio0");
  const multistreamRemoteAudioRef1 = useRef("multistreamRemoteAudio1");
  const multistreamRemoteAudioRef2 = useRef("multistreamRemoteAudio2");
  const multistreamRemoteShareAudioRef = useRef("multistreamRemoteShareAudio");
  const contextState = useMeeting();

  // console.log("Meeting status: " + contextState.meetingStatus);
  // console.log(
  //   `Media streams. Microphone: ${contextState.localMedia.audio}, Camera: ${contextState.localMedia.video}, Remote audio: ${contextState.remoteMedia.audio}, Remote video: ${contextState.remoteMedia.video}`
  // );

  /**
   * Set remote audio stream to the remote audio element
   */
  useEffect(() => {
    try {
      if (
        MEETING_STATUSES.IN_MEETING === contextState.meetingStatus &&
        contextState.remoteMedia.audio
      ) {
        if (remoteAudioRef.current.srcObject == null) {
          console.log("Setting remote audio");
          remoteAudioRef.current.srcObject =
            contextState.remoteMedia.audio.stream;
        }
      } else if (remoteAudioRef.current.srcObject != null) {
        console.log("Unsetting remote audio");
        remoteAudioRef.current.srcObject = null;
      }
    } catch (error) {
      console.log(`Error setting remote audio: ${error}`);
    }
  }, [contextState.remoteMedia.audio, contextState.meetingStatus]);

  /**
   * Set audio output device for the remote audio element
   */
  useEffect(() => {
    if (mediaDevices.selected?.audio_output.length > 0 && remoteAudioRef) {
      console.log(
        "Selected audio output: ",
        mediaDevices.selected.audio_output
      );
      remoteAudioRef.current.setSinkId(mediaDevices.selected.audio_output);
      multistreamRemoteAudioRef0.current.setSinkId(
        mediaDevices.selected.audio_output
      );
      multistreamRemoteAudioRef1.current.setSinkId(
        mediaDevices.selected.audio_output
      );
      multistreamRemoteAudioRef2.current.setSinkId(
        mediaDevices.selected.audio_output
      );
      multistreamRemoteShareAudioRef.current.setSinkId(
        mediaDevices.selected.audio_output
      );
    }
  }, [mediaDevices.selected]); //eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <ModalLeaveMeeting />
      <ModalDtmf />
      <ModalMeetingPassword />
      <ModalMeetingCaptcha />
      {/* <MeetingIdForm /> */}
      {contextState.isMultistream ? (
        <MeetingVideoViewMultistream />
      ) : (
        <MeetingVideoViewNormal />
      )}
      <Box visibility="hidden" height={0}>
        Remote Audio
        <audio id="remoteAudio" autoPlay ref={remoteAudioRef} />
        <audio
          id="multistreamRemoteAudio0"
          ref={multistreamRemoteAudioRef0}
          autoPlay
        ></audio>
        <audio
          id="multistreamRemoteAudio1"
          ref={multistreamRemoteAudioRef1}
          autoPlay
        ></audio>
        <audio
          id="multistreamRemoteAudio2"
          ref={multistreamRemoteAudioRef2}
          autoPlay
        ></audio>
        <audio
          id="multistreamRemoteShareAudio"
          ref={multistreamRemoteShareAudioRef}
          autoPlay
        ></audio>
      </Box>
      {/* <MeetingControls /> */}
    </div>
  );
};

MeetingView.propTypes = {
  mediaDevices: PropTypes.object,
};

const mapStateToProps = (state) => {
  return {
    mediaDevices: state.mediaDevices,
  };
};

export default connect(mapStateToProps)(MeetingView);
