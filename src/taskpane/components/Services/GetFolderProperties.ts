export async function getFolderProperties(fldId: string) {
  const AccessLinkStored =
    sessionStorage.getItem("AccessLink") || localStorage.getItem("AccessLink");

  const username =
    sessionStorage.getItem("userId") || localStorage.getItem("userId") || "";

  const password =
    sessionStorage.getItem("pass") || localStorage.getItem("pass") || "";

  if (!AccessLinkStored || !username || !password) {
    throw new Error("Missing login credentials");
  }

  const url = `${AccessLinkStored}/doccept/services/rest/folder/getProperties?fldId=${fldId}`;
  const authHeader = "Basic " + btoa(`${username}:${password}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  return await response.json();
}
