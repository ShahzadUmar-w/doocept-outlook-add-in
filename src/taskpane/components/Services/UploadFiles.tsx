
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
export async function uploadToDoccept(file, folderPath, docUuid, callback) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("docPath", folderPath);
  formData.append("docUuid", docUuid);
  formData.append("comment", "Uploaded from API Test");
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
  } catch (err) {
    callback(null, { message: err.message });
  }
}
