export const getRootFolderContentInfo = async () => {
      const AccessLinkStored = localStorage.getItem('AccessLink');

  const url = `${AccessLinkStored}/doccept/services/rest/repository/getRootFolder`;
  const username = localStorage.getItem("userId") || "";
  const password = localStorage.getItem("pass") || "";
  const authHeader = "Basic " + btoa(`${username}:${password}`);

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

  // FIX: Read once, log it, and return the variable
  const data = await res.json();
  console.log('getRootFolderContentInfo data:', data);
  return data; 
};

export const getFolderContentInfo = async (fldId: string) => {
      const AccessLinkStored = localStorage.getItem('AccessLink');
  const url = `${AccessLinkStored}/doccept/services/rest/folder/getChildren?fldId=${fldId}`;
  const username = localStorage.getItem("userId") || "";
  const password = localStorage.getItem("pass") || "";
  const authHeader = "Basic " + btoa(`${username}:${password}`);

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

  // FIX: Read once
  const data = await res.json();
  console.log('getFolderContentInfo data:', data);
  return data;
};