import React, { Component } from 'react';
import './Main.css';
import logo from './logo.svg';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
    };
  }
  handleChange = (event) => {
    this.setState({email: event.target.value});
  }
  handleSubmit = (event) => {
    alert("A name was submitted: " + this.state.email);
    event.preventDefault();
  }
  render() {
    return (
      <div className="page">
        <header className="header">
          <div className="row">
            <div className="right">
              <button className="headerButton">Login</button>
              <button className="headerButton">Register</button>
            </div>
          </div>
          <div className="row">
            <h1 className="headerTitle">Welcome to Matchery!</h1>
          </div>
        </header>
      </div>
    );
  }
}

export default App;
