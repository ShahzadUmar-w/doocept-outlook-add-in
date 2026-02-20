// // import React from "react";
// // import axios from "axios";

// // export const GetRootFolder =async () => {
  
// //     try {
// //       const response = await axios.get(
// //         "http://69.197.148.211/doccept/services/rest/repository/getRootFolder",
// //         {
// //           headers: {
// //             Authorization: "Bearer ZGVtb2FjY2Vzczp0ZXN0MTIz",
// //             // Cookie: "JSESSIONID=7E3BC9BEF9ED80ED0A87ECFE4B4FC1E0",
// //           },
// //         }
// //       );
// //       console.log(response.data);      
// //       return response.data;
// //     } catch (error) {
// //       console.error("Error fetching root folder:", error);
// //     }
// // };


// // import React from "react";
// // export const GetRootFolder = async () => {
// //   try {
// //     const response = await fetch("http://69.197.148.211/doccept/services/rest/repository/getRootFolder", {
// //       method: "GET",
// //       headers: {
// //         Authorization: "Bearer ZGVtb2FjY2Vzczp0ZXN0MTIz",
// //       },
// //     });

// //     if (!response.ok) {
// //       throw new Error(`HTTP error! Status: ${response.status}`);
// //     }

// //     const data = await response.json();
// //     console.log("Fetched Data:", data);

// //     // Ensure that data contains folders
// //     if (data && Array.isArray(data)) {
// //       return data.map((folder) => ({
// //         id: folder.id || `folder-${Math.random()}`,
// //         name: folder.name || "Unnamed Folder",
// //         type: "folder",
// //         children: folder.children ? folder.children.map((subFolder) => ({
// //           id: subFolder.id || `subfolder-${Math.random()}`,
// //           name: subFolder.name || "Unnamed Sub Folder",
// //           type: "folder",
// //           children: subFolder.children || [],
// //         })) : [],
// //       }));
// //     }

// //     throw new Error("Invalid data format received from API");
// //   } catch (error) {
// //     console.error("Error fetching root folder:", error);
// //     console.error("Possible reasons: Network issue, CORS, or server down.");

// //     // Return a fallback structure if API request fails
// //     return [
// //       {
// //         id: "root",
// //         name: "Demo Root Folder",
// //         type: "folder",
// //         children: Array.from({ length: 5 }, (_, i) => ({
// //           id: `folder-${i + 1}`,
// //           name: `Folder ${i + 1}`,
// //           type: "folder",
// //           children: [
// //             {
// //               id: `subfolder-${i + 1}-1`,
// //               name: `Sub Folder 1`,
// //               type: "folder",
// //               children: [],
// //             },
// //             {
// //               id: `subfolder-${i + 1}-2`,
// //               name: `Sub Folder 2`,
// //               type: "folder",
// //               children: [],
// //             },
// //           ],
// //         })),
// //       },
// //     ];
// //   }
// // };



// import React from "react";
// import { folders } from "../Utils/StaticFolders";
// export const GetRootFolder = async () => {
//   // try {
//   //   const response = await fetch("http://69.197.148.211/doccept/services/rest/repository/getRootFolder", {
//   //     method: "GET",
//   //     headers: {
//   //       Authorization: "Bearer ZGVtb2FjY2Vzczp0ZXN0MTIz",
//   //     },
//   //   });

//   //   if (!response.ok) {
//   //     throw new Error(`HTTP error! Status: ${response.status}`);
//   //   }

//   //   const data = await response.json();
//   //   console.log("Fetched Data:", data);

//   //   // Ensure that data contains folders
//   //   if (data && Array.isArray(data)) {
//   //     return data.map((folder) => ({
//   //       id: folder.id || `folder-${Math.random()}`,
//   //       name: folder.name || "Unnamed Folder",
//   //       type: "folder",
//   //       children: folder.children ? folder.children.map((subFolder) => ({
//   //         id: subFolder.id || `subfolder-${Math.random()}`,
//   //         name: subFolder.name || "Unnamed Sub Folder",
//   //         type: "folder",
//   //         children: subFolder.children || [],
//   //       })) : [],
//   //     }));
//   //   }

//   //   throw new Error("Invalid data format received from API");
//   // } catch (error) {
//   //   console.error("Error fetching root folder:", error);
//   //   console.error("Possible reasons: Network issue, CORS, or server down.");

//   //   // Return a fallback structure if API request fails
//   //   return [
//   //     {
//   //       id: "root",
//   //       name: "Demo Root Folder",
//   //       type: "folder",
//   //       children: Array.from({ length: 5 }, (_, i) => ({
//   //         id: `folder-${i + 1}`,
//   //         name: `Folder ${i + 1}`,
//   //         type: "folder",
//   //         children: [
//   //           {
//   //             id: `subfolder-${i + 1}-1`,
//   //             name: `Sub Folder 1`,
//   //             type: "folder",
//   //             children: [],
//   //           },
//   //           {
//   //             id: `subfolder-${i + 1}-2`,
//   //             name: `Sub Folder 2`,
//   //             type: "folder",
//   //             children: [],
//   //           },
//   //         ],
//   //       })),
//   //     },
//   //   ];
//   // }

// const folsers=folders

//   return folsers
// };

// services/docceptApi.ts

export const getRootFolderContentInfo = async () => {
  const url = `https://docceptdemo.com/doccept/services/rest/repository/getRootFolder`;

  const username =localStorage.getItem("userId")||"";
  const password =localStorage.getItem("pass")||"";




  const authHeader = "Basic " + btoa(`${username}:${password}`);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": authHeader,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    credentials: "include" // important if cookies needed
  });

  if (!res.ok) {
    throw new Error("Doccept API error: " + res.status);
  }

  return res.json();
};



export const getFolderContentInfo = async (fldId: string) => {
  const url = `https://docceptdemo.com/doccept/services/rest/folder/getChildren?fldId=${fldId}`;
  const username =localStorage.getItem("userId")||"";
  const password =localStorage.getItem("pass")||"";

  const authHeader = "Basic " + btoa(`${username}:${password}`);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": authHeader,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    credentials: "include" // important if cookies needed
  });

  if (!res.ok) {
    throw new Error("Doccept API error: " + res.status);
  }

  return res.json();
};