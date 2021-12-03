import React, { Component } from "react";
import axios from "axios";

class Post extends Component {
  state = {
    kind: "",
    team1: "",
    team2: "",
    betteam1: 100,
    betteam2: 100,
    winner: "None",
    betstatus: ""
  };

  onkindChange = e => {
    this.setState({
        kind: e.target.value
    });
  };

  onteam1Change = e => {
    this.setState({
        team1: e.target.value
    });
  };  onteam2Change = e => {
    this.setState({
        team2: e.target.value
    });
  };  onbetteam1Change = e => {
    this.setState({
        betteam1: e.target.value
    });
  };  onbetteam2Change = e => {
    this.setState({
        betteam2: e.target.value
    });
  };  onbetteam2Change = e => {
    this.setState({
        betteam2: e.target.value
    });
  };  onwinnerChange = e => {
    this.setState({
        winner: e.target.value
    });
  };onbetstatusChange = e => {
    this.setState({
        betstatus: e.target.value
    });
  };
  handleSubmit = e => {
    e.preventDefault();
    const data = {
      kind: this.state.kind,
      team1: this.state.team1,
      team2: this.state.team2,
      betteam1: this.state.betteam1,
      betteam2: this.state.betteam2,
      winner: this.state.winner,
      betstatus: this.state.betstatus
    };
    axios
      .post("http://localhost:5000/events", data)
      .then(res => console.log(res))
      .catch(err => console.log(err));
  };

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <input
            placeholder="kind" value={this.state.kind}
            onChange={this.onkindChange} required
          />
          <input
            placeholder="team1" value={this.state.team1}
            onChange={this.onteam1Change} required
          />
          <input
            placeholder="team2" value={this.state.team2}
            onChange={this.onteam2Change} required
          />
          <input
            placeholder="betteam1" value={this.state.betteam1}
            onChange={this.onbetteam1Change} required
          />
          <input
            placeholder="betteam2" value={this.state.betteam2}
            onChange={this.onbetteam2Change} required
          />
          <input
            placeholder="winner" value={this.state.winner}
            onChange={this.onwinnerChange} required
          />
          <input
            placeholder="betstatus" value={this.state.betstatus}
            onChange={this.onbetstatusChange} required
          />
          <button type="submit">Add</button>
        </form>
      </div>
    );
  }
}

export default Post;