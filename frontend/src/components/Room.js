import React, { useState, useEffect } from "react";
import { Grid, Button, Typography } from "@material-ui/core";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import { useParams, useNavigate } from "react-router-dom";

const Room = (props) => {
  const { roomCode } = useParams(); // Get the roomCode from the URL
  const navigate = useNavigate(); // Hook to handle navigation
  const [state, setState] = useState({
    votesToSkip: 2,
    guestCanPause: false,
    isHost: false,
    showSettings: false,
    spotifyAuthenticated: false,
    song: {},
  });

  useEffect(() => {
    getRoomDetails();
    const interval = setInterval(getCurrentSong, 1000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this effect runs once on mount

  const getRoomDetails = async () => {
    try {
      const response = await fetch(`/api/get-room?code=${roomCode}`);
      if (!response.ok) {
        props.leaveRoomCallback();
        navigate("/");
        return;
      }
      const data = await response.json();
      setState({
        votesToSkip: data.votes_to_skip,
        guestCanPause: data.guest_can_pause,
        isHost: data.is_host,
        showSettings: state.showSettings,
        spotifyAuthenticated: state.spotifyAuthenticated,
        song: state.song,
      });
      if (data.is_host) {
        authenticateSpotify();
      }
    } catch (error) {
      console.error("Error fetching room details:", error);
    }
  };

  const authenticateSpotify = async () => {
    try {
      const response = await fetch("/spotify/is-authenticated");
      const data = await response.json();
      setState(prevState => ({
        ...prevState,
        spotifyAuthenticated: data.status
      }));
      if (!data.status) {
        const authResponse = await fetch("/spotify/get-auth-url");
        const authData = await authResponse.json();
        window.location.replace(authData.url);
      }
    } catch (error) {
      console.error("Error authenticating Spotify:", error);
    }
  };

  const getCurrentSong = async () => {
    try {
      const response = await fetch("/spotify/current-song");
      if (!response.ok) {
        return {};
      }
      const data = await response.json();
      setState(prevState => ({
        ...prevState,
        song: data
      }));
    } catch (error) {
      console.error("Error fetching current song:", error);
    }
  };

  const leaveButtonPressed = async () => {
    try {
      await fetch("/api/leave-room", { method: "POST", headers: { "Content-Type": "application/json" } });
      props.leaveRoomCallback();
      navigate("/");
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  const updateShowSettings = (value) => {
    setState(prevState => ({
      ...prevState,
      showSettings: value
    }));
  };

  const renderSettings = () => (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <CreateRoomPage
          update={true}
          votesToSkip={state.votesToSkip}
          guestCanPause={state.guestCanPause}
          roomCode={roomCode}
          updateCallback={getRoomDetails}
        />
      </Grid>
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="secondary"
          onClick={() => updateShowSettings(false)}
        >
          Close
        </Button>
      </Grid>
    </Grid>
  );

  const renderSettingsButton = () => (
    <Grid item xs={12} align="center">
      <Button
        variant="contained"
        color="primary"
        onClick={() => updateShowSettings(true)}
      >
        Settings
      </Button>
    </Grid>
  );

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography variant="h4" component="h4">
          Code: {roomCode}
        </Typography>
      </Grid>
      <MusicPlayer {...state.song} />
      {state.isHost ? renderSettingsButton() : null}
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="secondary"
          onClick={leaveButtonPressed}
        >
          Leave Room
        </Button>
      </Grid>
      {state.showSettings && renderSettings()}
    </Grid>
  );
};

export default Room;