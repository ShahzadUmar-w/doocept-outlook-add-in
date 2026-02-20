/* eslint-disable no-unreachable */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
export default function LoaderApp() {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%", position: "fixed", top: "0", left: "0", backgroundColor: "rgba(255,255,255,0.8)", zIndex: "9999" }}>
           <img src={require('../../../../assets/Preloader.gif')} alt="" />
        </div>
    )
}
