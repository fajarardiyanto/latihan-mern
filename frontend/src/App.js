import React, { useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";

import Auth from "./user/pages/Auth";
import Users from "./user/pages/Users";
import NewPlace from "./places/pages/NewPlaces";
import UserPlaces from "./places/pages/UserPlaces";
import UpdatePlaces from "./places/pages/UpdatePlaces";
import { AuthContext } from "./shared/context/auth-context";
import MainNavigation from "./shared/components/Navigation/MainNavigation";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(false);

  const login = useCallback((uid) => {
    setIsLoggedIn(true);
    setUserId(uid);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserId(null);
  }, []);

  let routes;

  if (isLoggedIn) {
    routes = (
      <Switch>
        <Route path="/" exact>
          {" "}
          <Users />{" "}
        </Route>
        <Route path="/:userId/places" exact>
          {" "}
          <UserPlaces />{" "}
        </Route>
        <Route path="/places/new" exact>
          {" "}
          <NewPlace />{" "}
        </Route>
        <Route path="/places/:placeId" exact>
          {" "}
          <UpdatePlaces />{" "}
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          {" "}
          <Users />{" "}
        </Route>
        <Route path="/:userId/places" exact>
          {" "}
          <UserPlaces />{" "}
        </Route>
        <Route path="/auth" exact>
          {" "}
          <Auth />{" "}
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: isLoggedIn,
        userId: userId,
        login: login,
        logout: logout,
      }}
    >
      <Router>
        <MainNavigation />
        <main>{routes}</main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
