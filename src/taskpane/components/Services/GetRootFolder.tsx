// export const getRootFolderContentInfo = async () => {
//       const AccessLinkStored = localStorage.getItem('AccessLink');

//   const url = `${AccessLinkStored}/doccept/services/rest/repository/getRootFolder`;
//   const username = localStorage.getItem("userId") || "";
//   const password = localStorage.getItem("pass") || "";
//   const authHeader = "Basic " + btoa(`${username}:${password}`);

//   const res = await fetch(url, {
//     method: "GET",
//     headers: {
//       "Authorization": authHeader,
//       "Accept": "application/json",
//       "Content-Type": "application/json"
//     },
//     credentials: "include"
//   });

//   if (!res.ok) throw new Error("Doccept API error: " + res.status);

//   // FIX: Read once, log it, and return the variable
//   const data = await res.json();
//   console.log('getRootFolderContentInfo data:', data);
//   return data; 
// };

// export const getFolderContentInfo = async (fldId: string) => {
//       const AccessLinkStored = localStorage.getItem('AccessLink');
//   const url = `${AccessLinkStored}/doccept/services/rest/folder/getChildren?fldId=${fldId}`;
//   const username = localStorage.getItem("userId") || "";
//   const password = localStorage.getItem("pass") || "";
//   const authHeader = "Basic " + btoa(`${username}:${password}`);

//   const res = await fetch(url, {
//     method: "GET",
//     headers: {
//       "Authorization": authHeader,
//       "Accept": "application/json",
//       "Content-Type": "application/json"
//     },
//     credentials: "include"
//   });

//   if (!res.ok) throw new Error("Doccept API error: " + res.status);

//   // FIX: Read once
//   const data = await res.json();
//   console.log('getFolderContentInfo data:', data);
//   return data;
// };

// Helper function to get credentials from either Session or Local storage
const getAuthCredentials = () => {
  const username = sessionStorage.getItem("userId") || localStorage.getItem("userId") || "";
  const password = sessionStorage.getItem("pass") || localStorage.getItem("pass") || "";
  const accessLink = sessionStorage.getItem("AccessLink") || localStorage.getItem("AccessLink") || "";
  
  const authHeader = "Basic " + btoa(`${username}:${password}`);
  
  return { authHeader, accessLink };
};

export const getRootFolderContentInfo = async () => {
  const { authHeader, accessLink } = getAuthCredentials();

  if (!accessLink) throw new Error("Access Link not found");

  const url = `${accessLink}/doccept/services/rest/repository/getRootFolder`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": authHeader,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    credentials: "include"
  });

  if (!res.ok) throw new Error("Doccept API error: " + res.status);

  const data = await res.json();
  console.log('getRootFolderContentInfo data:', data);
  return data; 
};

export const getFolderContentInfo = async (fldId: string) => {
  const { authHeader, accessLink } = getAuthCredentials();

  if (!accessLink) throw new Error("Access Link not found");

  const url = `${accessLink}/doccept/services/rest/folder/getChildren?fldId=${fldId}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": authHeader,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    credentials: "include"
  });

  if (!res.ok) throw new Error("Doccept API error: " + res.status);

  const data = await res.json();
  console.log('getFolderContentInfo data:', data);
  return data;
};