// /* eslint-disable react/jsx-no-undef */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable no-undef */
// /* eslint-disable prettier/prettier */
// import React, { useEffect, useState } from "react";
// import { HashRouter as Router, Routes, Route } from "react-router-dom";
// import Login from "../layout/Main/Login";
// import Home from "../layout/Main/Home";
// import UploadPage from "../layout/Main/UploadPgae";

// const RouterApp: React.FC = () => {
//     return (
//         <>
//             <Router>
//                 <Routes>
//                     <Route path="/" element={<Login />} />
//                     <Route path="/Home" element={<Home />} />
//                     <Route path="/Upload" element={<UploadPage/>} />
//                 </Routes>
//             </Router>
//         </>
//     )

// }

// export default RouterApp;
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../layout/Main/Login";
import Home from "../layout/Main/Home";
import { Toaster } from "react-hot-toast";
// import UploadPage from "../layout/Main/UploadPgae";

const RouterApp: React.FC = () => {

    return (
        <>
         <Toaster position="bottom-center" reverseOrder={false}  toastOptions={{
    style: {
      borderRadius: "10px",
      background: "#333",
      color: "#fff",
      fontSize: "9px",
    },
  }}/>
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/Home" element={<Home />} />
                    {/* <Route path="/Upload" element={<UploadPage setUploadRedy/>} /> */}

                </Routes>
            </Router>
        </>
    )

}

export default RouterApp;