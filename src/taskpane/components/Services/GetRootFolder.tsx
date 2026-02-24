export const getRootFolderContentInfo = async () => {
  const url = `https://docceptdemo.com/doccept/services/rest/repository/getRootFolder`;

  const username =localStorage.getItem("userId")||"";
  const password =localStorage.getItem("pass")||"";
console.log("Username:", username);
console.log("password:", password);



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