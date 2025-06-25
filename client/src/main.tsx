import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Form from "./forms.tsx";
import Landing from "./landing";  
import Landingnotadmin from "./landingnotadmin.tsx";  
import Adduser from "./adduser.tsx";  
import Addquestion from "./addquestion.tsx";  
import Addlesson from "./addlesson.tsx";  


import Deleteuser from "./deleteuser.tsx";  
import Updatepassword from "./newpassword.tsx";  


import RequireAdmin from "./requireadmin.tsx";
import Taketest from "./taketest.tsx";
import Takelesson from "./takelesson.tsx";

import FullTestPage from "./fulltestpage.tsx";
import FullLessonPage from "./fulllessonpage.tsx";

import CheckAnswer from "./checkanswer.tsx";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* public routes */}
        <Route path="/" element={<Form />} />
        <Route path="/landingnotadmin" element={<Landingnotadmin />} />
        <Route path="/taketest" element={<Taketest/>} />
                <Route path="/takelesson" element={<Takelesson/>} />

        <Route path="/test/:courseId" element={<FullTestPage />} />
                <Route path="/lesson/:courseId" element={<FullLessonPage />} />

         <Route path="/newpassword" element={<Updatepassword />}/>

        {/* protected admin routes */}
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
