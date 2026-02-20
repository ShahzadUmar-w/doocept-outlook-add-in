export async function getFolderProperties(fldId: string) {
  const url = `https://docceptdemo.com/doccept/services/rest/folder/getProperties?fldId=${fldId}`;

   const username =localStorage.getItem("userId")||"";
  const password =localStorage.getItem("pass")||"";

  // Basic Auth header
  const authHeader = "Basic " + btoa(`${username}:${password}`);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      credentials: "include", // include cookies like JSESSIONID if needed
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Doccept Get Properties Error:", error);
    throw error;
  }
}
