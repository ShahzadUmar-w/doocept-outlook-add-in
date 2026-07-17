
    function parseDocceptError(xmlText: string) {
  try {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "text/xml");

    const errorCode = xml.getElementsByTagName("errorCode")[0]?.textContent;
    const errorMsg = xml.getElementsByTagName("errorMsg")[0]?.textContent;

    return {
      errorCode,
      errorMsg,
    };
  } catch {
    return null;
  }
}
export async function uploadToDoccept(file:any, folderPath:any, docUuid:any, callback:any) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("docPath", folderPath);
  formData.append("docUuid", docUuid);
  formData.append("comment", "Uploaded from doccept outlook plugin");
  formData.append("importZip", "false");
  formData.append("extractText", "false");
  formData.append("slctdCategory", "");
  formData.append("notifyChecked", "false");
  formData.append("notifyUsers", "");
  formData.append("roles", "ROLE_*");
  formData.append("message", "");

  const username = localStorage.getItem("userId") || "";
  const password = localStorage.getItem("pass") || "";
  const base64 = btoa(`${username}:${password}`);
    const AccessLinkStored = localStorage.getItem('AccessLink');

  try {
    const resp = await fetch(
      `${AccessLinkStored}/doccept/services/rest/uploadService/insert`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${base64}`,
        },
        body: formData,
        credentials: "include",
      }
    );

    const text = await resp.text();

    // ❌ If API failed
    if (!resp.ok) {
      const parsed = parseDocceptError(text);
      const message =
        parsed?.errorMsg || `Upload failed (${resp.status})`;

      callback(null, { message });
      return;
    }

    // ✅ Success
    callback(text, null);
  } catch (err:any) {
    callback(null, { message: err.message });
  }
}


/**
 * XML Error Parser
 * Doccept API aksar errors XML format mein deta hai, usey readable banane ke liye
 */
// function parseDocceptError(xmlText: string) {
//   try {
//     const parser = new DOMParser();
//     const xml = parser.parseFromString(xmlText, "text/xml");

//     const errorCode = xml.getElementsByTagName("errorCode")[0]?.textContent;
//     const errorMsg = xml.getElementsByTagName("errorMsg")[0]?.textContent;

//     return { errorCode, errorMsg };
//   } catch {
//     return null;
//   }
// }

// /**
//  * Helper to get credentials from Session or Local Storage
//  */
// const getAuthCredentials = () => {
//   const username = sessionStorage.getItem("userId") || localStorage.getItem("userId") || "";
//   const password = sessionStorage.getItem("pass") || localStorage.getItem("pass") || "";
//   const accessLink = sessionStorage.getItem("AccessLink") || localStorage.getItem("AccessLink") || "";
  
//   const authHeader = "Basic " + btoa(`${username}:${password}`);
  
//   return { authHeader, accessLink };
// };

// /**
//  * Main Upload Function
//  */
// export async function uploadToDoccept(file: File, folderPath: string, docUuid: string, callback: (data: any, err: any) => void) {
//   const { authHeader, accessLink } = getAuthCredentials();

//   if (!accessLink) {
//     callback(null, { message: "Access Link is missing. Please log in again." });
//     return;
//   }

//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("docPath", folderPath);
//   formData.append("docUuid", docUuid);
//   formData.append("comment", "Uploaded from doccept outlook plugin");
//   formData.append("importZip", "false");
//   formData.append("extractText", "false");
//   formData.append("slctdCategory", "");
//   formData.append("notifyChecked", "false");
//   formData.append("notifyUsers", "");
//   formData.append("roles", "ROLE_*");
//   formData.append("message", "");

//   try {
//     const resp = await fetch(
//       `${accessLink}/doccept/services/rest/uploadService/insert`,
//       {
//         method: "POST",
//         headers: {
//           "Authorization": authHeader,
//           // Note: FormData ke saath Content-Type manually set nahi karna chahiye, 
//           // fetch usey khud boundary ke saath set kar deta hai.
//         },
//         body: formData,
//         credentials: "include",
//       }
//     );

//     const text = await resp.text();

//     // ❌ If API failed (Status code 4xx or 5xx)
//     if (!resp.ok) {
//       const parsed = parseDocceptError(text);
//       const message = parsed?.errorMsg || `Upload failed (Status: ${resp.status})`;
//       callback(null, { message });
//       return;
//     }

//     // ✅ Success
//     callback(text, null);
//   } catch (err: any) {
//     console.error("Upload Service Error:", err);
//     callback(null, { message: err.message || "Network Error" });
//   }
// }