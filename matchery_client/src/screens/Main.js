// IMPORT COMPONENTS
import React, { Component } from 'react';
import 'whatwg-fetch';
import Dashboard from './Dashboard'; // Dashboard component
import Login from './Login'; // Login component
import SignUp from './SignUp'; // SignUp component
import Matches from './Matches';
import Admin from './Admin/Admin'; // Admin component
import Judge from './Judge/Judge'; // Judge component
import Candidate from './Candidate/Candidate'; // Candidate component

// IMPORT STYLING
import './Main.css'; // Header and background styling
// Note: Component-specific styling is imported through
// the components themselves

// MAIN APP COMPONENT CLASS
class App extends Component {

  // Component constructor
  constructor(props) {
    super(props);
    this.candidateChild = React.createRef();
    this.state = {
      showLogin: true,
      showSignUp: false,
      showDashboard: false, // Main screen
      showAdmin: false,
      showJudge: false,
      showCandidate: false,
      showBackButton: false,
      candidateGroupList: [],
      events: { // TODO This will need to be pulled from the server
        'administrator' : [],
        'judge' : [],
        'candidate' : []
      },
    };
  }

  // Function to check if a session
  // already exists.
  componentDidMount() {
    const token = localStorage.getItem('session');
    if (token) {
      fetch('/api/account/verify?token=' + token)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            this.fetchUserPermissions();
          }
        });
    }
  }

  // Function to fetch the user's
  // roles and events.
  fetchUserPermissions = () => {
    fetch('/api/account/getEvents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: localStorage.getItem('username')
      }),
    }).then(res => res.json())
      .then(json => {
        if (json.success) { // If user exists
          var EventsObject = {  // DUMMY DATA
            "events": [
              {
                "eventName": "2018 Acapella",
                "admins": [
                  "Adam",
                ],
                "candidates": {
                  "test1": {
                    "list": [
                      "Sensasions",
                      "After Dark",
                      "After Light",
                    ],
                    "notList": [
                      "The Amateurs",
                    ],
                  },
                  "test2": {
                    "list": [
                      "Sensasions",
                      "After Dark",
                    ],
                    "notList": [
                      "The Amateurs",
                    ],
                  },
                },
                "groups": [
                  {
                    "groupName": "Sensasions",
                    "judges": [
                      "test3",
                      "Fiona",
                    ],
                    "list": [
                      "Bailey",
                      "Carl",
                    ],
                    "newList": [
                      "test2",
                    ],
                    "notList": [
                      "test1",
                    ],
                  },
                  {
                    "groupName": "After Dark",
                    "judges": [
                      "Ephraim",
                      "George",
                    ],
                    "ranking": [
                      "Carl",
                      "Bailey",
                    ],
                  },
                  {
                    "groupName": "The Amateurs",
                    "judges": [
                      "Halley",
                      "Frederick",
                    ],
                    "ranking": [
                      "Bailey",
                      "Carl",
                    ],
                  },
                ],
              },
              {
                "eventName": "LNYF",
              },
            ]
          };
          var username = localStorage.getItem('username');
          var eventsList = EventsObject.events;
          // Iterate through all the events
          eventsList.forEach((event) => {
            if (
              event.hasOwnProperty("eventName") &&
              event.hasOwnProperty("admins") &&
              event.hasOwnProperty("candidates") &&
              event.hasOwnProperty("groups")
            ) {
              if (event.admins.includes(username)) {
                // User is an admin for this event

                var t_events = this.state.events;
                t_events.administrator.push(event.eventName);

              } else if (event.candidates.hasOwnProperty(username)) {
                // If the user is a candidate for this event...

                // We push an object to the this.state.events.candidate
                // that contains some information.
                var pushToCandidate = {
                  "eventName": event.eventName,
                  "list": event.candidates[username].list,
                  "notList": event.candidates[username].notList,
                };
                var t_events = this.state.events;
                t_events.candidate.push(pushToCandidate);
                this.setState({events: t_events});

              } else { // Check if judge
                event.groups.forEach((group) => {
                  if (group.judges.includes(username)) {
                    // User is a judge for this event
                    var t_events = this.state.events;
                    t_events.judge.push(event.eventName);
                  }
                })
              }
            }
          });
          this.setState({
            showLogin: false,
            showDashboard: true,
            /*
            events: {
              'Administrator': ['WashU Acappella Auditions 2018'],
              'Judge': ['WashU LNYF Auditions 2018'],
              'Candidate': ['WashU New Chancellor Auditions 2018'],
            },
            */
          });
        }
      });
  }

  // Function to logIn a user.
  handleLogIn = (e, username, password) => {
    e.preventDefault();
    // Login request
    fetch('/api/account/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    }).then(res => res.json())
      .then(json => {
        console.log('json', json);
        // alert(json.message);
        if (json.success) {
          localStorage.setItem('session', json.token);
          localStorage.setItem('username', json.username);
          this.fetchUserPermissions(e);
        }
      });
  }

  // Function to logOut the user.
  handleLogOut = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('session');
    if (token) {
      fetch('/api/account/logout?token=' + token)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            // alert("Logged out!");
            this.setState({
              showLogin: true,
              showDashboard: false,
              events: {
                'administrator' : [],
                'judge' : [],
                'candidate' : []
              },
            });
          }
        });
    }
  }

  // Function to open the signUp page.
  openSignUp = (e) => {
    e.preventDefault();
    this.setState({
      showSignUp: true,
    });
  }

  // Function to close the signUp page.
  closeSignUp = (e) => {
    e.preventDefault();
    this.setState({
      showSignUp: false,
    });
  }

  // Function to register a new user
  // in the database.
  handleSignUpSubmit = (e, firstName, lastName, email, username, password) => {
    //Insert in database
    fetch('/api/account/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        email: email,
        username: username,
        password: password
      }),
    }).then(res => res.json())
      .then(json => {
          console.log('json', json);
          // alert(json.message);
        });
  }

  // Function to navigate from the dashboard
  // page to the admin page.
  dashboardToAdmin = (e) => {
    this.setState({
      showDashboard: false,
      showAdmin: true,
      showBackButton: true,
    });
  }

  // Function to navigate from the dashboard
  // page to the judge page.
  dashboardToJudge = (e) => {
    this.setState({
      showDashboard: false,
      showJudge: true,
      showBackButton: true,
    });
  }

  // Function to navigate from the dashboard
  // page to the candidate page for a specific event
  // given an eventName.
  dashboardToCandidate = (e, eventName) => {
    this.state.events.candidate.forEach((event) => {
      if (event.eventName === eventName) {
        // If we have found the right event...
        // forward the eventName, the list, and the notList
        // to the candidate page.
        this.candidateChild.current.setEventName(event.eventName);
        this.candidateChild.current.getList(event.list);
        this.candidateChild.current.getNotList(event.notList);
        // Display the candidate page.
        this.setState({
          showDashboard: false,
          showCandidate: true,
          showBackButton: true,
        });
      }
    })
  }

  candidatePropagate = (eventName, list, notList) => {
    var temp_events = this.state.events;
    temp_events.candidate.forEach((event) => {
      if (event.eventName === eventName) {
        event.list = list;
        event.notList = notList;
        this.setState({
          events: temp_events,
        }, () => {
          console.dir(this.state.events);
        });
      }
    })
  }

  // Render the Main application
  render() {

    // Styling constants for showing different screens
    const showLogin = this.state.showLogin ? {display:'block'} : {display:'none'};
    const showSignUp = this.state.showSignUp ? {display:'block'} : {display:'none'};
    const showDashboard = this.state.showDashboard ? {display:'block'} : {display:'none'};
    const showAdmin = this.state.showAdmin ? {display:'block'} : {display:'none'};
    const showJudge = this.state.showJudge ? {display:'block'} : {display:'none'};
    const showCandidate = this.state.showCandidate ? {display:'block'} : {display:'none'};

    const loggedIn = (this.state.showLogin || this.state.showSignUp) ? {display:'none'} : {display:'block'};
    const notInDashboardButLoggedIn = (!this.state.showLogin && !this.state.showSignUp && !this.state.showDashboard) ? {display:'block'} : {display: 'none'};
    const inDashboardOrNotLoggedIn = (this.state.showLogin || this.state.showSignUp || this.state.showDashboard) ? {display:'block'} : {display: 'none'};
    const showBackButton = this.state.showBackButton ? {display:'block'} : {display:'none'};
    // TODO: make the Matchery logo clickable

    // Return the app frame (header and background)
    return (
      <div>

        <header className="header">
          <div className="header__container">
            <div
              className="header__logo-box-clickable"
              style={notInDashboardButLoggedIn}
              onClick={(e) => {this.setState({
                showBackButton: false,
                showDashboard: true,
                showJudge: false,
                showAdmin: false,
                showCandidate: false,
              })}}>
              Matchery
            </div>
            <div
              className="header__logo-box"
              style={inDashboardOrNotLoggedIn}>
              Matchery
            </div>
            <div style={loggedIn}
              onClick={(e) => {this.handleLogOut(e)}}
              className="header__my-account-box">
              LogOut
              <ion-icon className="header__down-arrow-icon" name="arrow-dropdown"></ion-icon>
            </div>
          </div>
        </header>

        <div style={showBackButton} onClick={(e) => {this.setState({
          showBackButton: false,
          showDashboard: true,
          showJudge: false,
          showAdmin: false,
          showCandidate: false,
        })}}>
          <div className="container-btn-back">
            <button className="btn-back">
              <ion-icon className="btn-back__icon" name="arrow-dropleft"></ion-icon>
              Back
            </button>
          </div>
        </div>

        <div style={showLogin}>
          <Login
            parentHandleLogin={this.handleLogIn}
            parentHandleSignup={this.openSignUp}
            fetchUserPermissions = {this.fetchUserPermissions}
          />
        </div>

        <div style={showSignUp}>
          <SignUp
            parentHandleLogin={this.handleLogIn}
            parentHandleSignup={this.openSignUp}
            parentHandleExitSignup={this.closeSignUp}
            parentHandleSignupSubmit={this.handleSignUpSubmit}
          />
        </div>

        <div style={showDashboard}>
          <Dashboard
            dashboardToAdmin={this.dashboardToAdmin}
            dashboardToJudge={this.dashboardToJudge}
            dashboardToCandidate={this.dashboardToCandidate}
            events={this.state.events}
          />
        </div>

        <div style={showAdmin}>
          <Admin />
        </div>

        <div style={showJudge}>
          <Judge />
        </div>

        <div style={showCandidate}>
          <Candidate
            ref={this.candidateChild}
            propagate={this.candidatePropagate}
          />
        </div>

      </div>
    );
  }
}
export default App;
