import React, { Component } from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";
import { Grid, Button, ButtonGroup, Typography } from "@material-ui/core";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate
} from "react-router-dom";
import Info from "./Info";

export default class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: null,
    };
    this.clearRoomCode = this.clearRoomCode.bind(this);
  }

  async componentDidMount() {
    try {
      const response = await fetch("/api/user-in-room");
      const data = await response.json();
      this.setState({
        roomCode: data.code,
      });
    } catch (error) {
      console.error("Error fetching room data:", error);
    }
  }

  clearRoomCode() {
    this.setState({
      roomCode: null,
    });
  }

  renderHomePage() {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} align="center">
          <Typography variant="h3">
            House Party
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <ButtonGroup disableElevation variant="contained" color="primary">
            <Button color="primary" component={Link} to="/join">
              Join a Room
            </Button>
            <Button color="default" component={Link} to="/info">
              Info
            </Button>
            <Button color="secondary" component={Link} to="/create">
              Create a Room
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    );
  }

  render() {
    return (
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              this.state.roomCode ? (
                <Navigate to={`/room/${this.state.roomCode}`} />
              ) : (
                this.renderHomePage()
              )
            }
          />
          <Route path="/join" element={<RoomJoinPage />} />
          <Route path="/info" element={<Info />} />
          <Route path="/create" element={<CreateRoomPage />} />
          <Route
            path="/room/:roomCode"
            element={
              <Room leaveRoomCallback={this.clearRoomCode} />
            }
          />
        </Routes>
      </Router>
    );
  }
}
