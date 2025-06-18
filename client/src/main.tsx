import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Form from "./forms.tsx";
import Landing from "./landing";  
import Landingnotadmin from "./landingnotadmin.tsx";  
import Adduser from "./adduser.tsx";  
import Addquestion from "./addquestion.tsx";  

import Deleteuser from "./deleteuser.tsx";  
import Updatepassword from "./newpassword.tsx";  

import RequireAdmin from "./requireadmin.tsx";   // ← NEW
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* public routes */}
        <Route path="/" element={<Form />} />
        <Route path="/landingnotadmin" element={<Landingnotadmin />} />

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
          path="/deleteuser"
          element={
            <RequireAdmin>
              <Deleteuser />
            </RequireAdmin>
          }
        />
        <Route
          path="/newpassword"
          element={
            <RequireAdmin>
              <Updatepassword />
            </RequireAdmin>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
