import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Form from "./forms.tsx";
import Landing from "./landing";  
import Landingnotadmin from "./landingnotadmin.tsx";  
import Adduser from "./adduser.tsx";  
import Addquestion from "./addquestion.tsx";  
import Addlesson from "./addlesson.tsx";  
import Chooseadmin from "./chooseadminnotadmin.tsx";  



import Deleteuser from "./deleteuser.tsx";  
import Updatepassword from "./newpassword.tsx";  


import RequireAdmin from "./requireadmin.tsx";
import Taketest from "./taketest.tsx";
import Takelesson from "./takelesson.tsx";

import FullTestPage from "./fulltestpage.tsx";
import FullLessonPage from "./fulllessonpage.tsx";

import CheckAssignedAnswer from "./checkassignedanswer.tsx";

import CheckAnswer from "./checkanswer.tsx";
import ViewOwnScore from "./viewownscore.tsx";
import RequireAuth from "./requireauth.tsx"; // import the new component
import Assigncourse from "./assigncourse.tsx"; // import the new component



import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
  {/* public route */}
  <Route path="/" element={<Form />} />

  {/* routes that require login */}
  <Route
    path="/landingnotadmin"
    element={
      <RequireAuth>
        <Landingnotadmin />
      </RequireAuth>
    }
  />
  <Route
    path="/viewownscore"
    element={
      <RequireAuth>
        <ViewOwnScore />
      </RequireAuth>
    }
  />
  <Route
    path="/taketest"
    element={
      <RequireAuth>
        <Taketest />
      </RequireAuth>
    }
  />
  <Route
    path="/takelesson"
    element={
      <RequireAuth>
        <Takelesson />
      </RequireAuth>
    }
  />
  <Route
    path="/test/:courseId"
    element={
      <RequireAuth>
        <FullTestPage />
      </RequireAuth>
    }
  />
  <Route
    path="/lesson/:courseId"
    element={
      <RequireAuth>
        <FullLessonPage />
      </RequireAuth>
    }
  />
  <Route
    path="/newpassword"
    element={
      <RequireAuth>
        <Updatepassword />
      </RequireAuth>
    }
  />

  {/* admin-only routes */}
  <Route
    path="/landing"
    element={
      <RequireAdmin>
        <Landing />
      </RequireAdmin>
    }
  />
  <Route
    path="/checkanswer"
    element={
      <RequireAdmin>
        <CheckAnswer />
      </RequireAdmin>
    }
  />
    <Route
    path="/checkassignedanswer"
    element={
      <RequireAdmin>
        <CheckAssignedAnswer />
      </RequireAdmin>
    }
  />

    <Route
    path="/chooseadminnotadmin"
    element={
      <RequireAdmin>
        <Chooseadmin/>
      </RequireAdmin>
    }
  />
  <Route
    path="/adduser"
    element={
      <RequireAdmin>
        <Adduser />
      </RequireAdmin>
    }
  />
  <Route
    path="/addquestion"
    element={
      <RequireAdmin>
        <Addquestion />
      </RequireAdmin>
    }
  />\
    <Route
    path="/assigncourse"
    element={
      <RequireAdmin>
        <Assigncourse />
      </RequireAdmin>
    }
  />
  <Route
    path="/addlesson"
    element={
      <RequireAdmin>
        <Addlesson />
      </RequireAdmin>
    }
  />
  <Route
    path="/deleteuser"
    element={
      <RequireAdmin>
        <Deleteuser />
      </RequireAdmin>
    }
  />
</Routes>

    </BrowserRouter>
  </React.StrictMode>
);
