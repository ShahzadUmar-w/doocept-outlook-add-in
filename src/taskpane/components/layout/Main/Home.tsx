import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Button,
  Snackbar,
  Alert,
  Slide,
  Zoom,
  Grow,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { TreeItem, TreeView } from "@mui/x-tree-view";
import { FcFolder, FcOpenedFolder } from "react-icons/fc";
import { MdDelete } from "react-icons/md";
import { ImFileEmpty } from "react-icons/im";

import HeaderAppBar from "../Header/HeaderAppBar";
import LoaderApp from "../../Loader/Loader";
import { useTheme } from "../../styles/TheemProvider";
import UploadPage from "./UploadPgae";
import { getFolderContentInfo, getRootFolderContentInfo } from "../../Services/GetRootFolder";
import { Get_Token_SSO } from "../../Services/SSO_For_Graph";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedFolderName, setSelectedFolderName] = useState<string | null>(null);

  const [loader, setLoader] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: boolean }>({});
  const [folders, setFolders] = useState<any[]>([]);
  const [Selectedfiles, setSelectedfiles] = useState<any[]>([]);

  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "error" | "success" }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [uploadReady, setUploadReady] = useState(false);
  const [uploadData, setUploadData] = useState<{
    Selectedfiles: any[];
    folderUuid: string;
    folderPath: string;
  } | null>(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const init = async () => {
      await handleGetRootFolder();
      handleGetEmail_and_Attachemnts();
    };

    init();
  }, []);


  // Recursively fetch children for any folder
  // const fetchChildrenRecursively = async (folder: any) => {
  //   if (folder.hasChildren) {
  //     const res = await getFolderContentInfo(folder.uuid);
  //     folder.children = res.folder || [];
  //     for (let child of folder.children) {
  //       await fetchChildrenRecursively(child);
  //     }
  //   }
  // };

  const fetchChildrenRecursively = async (folder: any) => {
    // Ensure hasChildren is true and children is null/not already processed
    if (folder.hasChildren === true && !folder.children) {
      console.log(`[Tree Load] Fetching children for: ${folder.name} (UUID: ${folder.uuid})`);
      try {
        // Call the API for children of this specific folder
        const res = await getFolderContentInfo(folder.uuid);

        // Check the response structure again, just in case
        if (res?.folders?.length > 0) {
          folder.children = res.folders; // Assuming the children response structure is the SAME as getRootFolderContentInfo
          console.log(`[Tree Load] Successfully fetched ${folder.children.length} children for ${folder.name}.`);

          // Recursive call for the newly fetched children
          for (let child of folder.children) {
            await fetchChildrenRecursively(child);
          }
        } else {
          folder.children = []; // Mark as processed but empty if response is bad
          console.warn(`[Tree Load] API returned no 'folders' array for ${folder.name}. Treating as no children.`);
        }
      } catch (error: any) {
        // CRITICAL: Log detailed error for the CHILD API call
        console.error(`[Tree Load ERROR] Failed to fetch children for ${folder.name} (${folder.uuid}). Error: ${error.message}`);
        // Set children to empty array so recursion stops for this branch and UI doesn't hang
        folder.children = [];
        setToast({
          open: true,
          message: `Could not load subfolders for '${folder.name}'.`,
          severity: "error"
        });
      }
    } else if (folder.hasChildren === false || folder.children) {
      // Already processed or explicitly has no children
      console.log(`[Tree Load] Skipping ${folder.name}: already processed or no children flag set.`);
    }
  };


  const handleGetRootFolder = async () => {
    setLoader(true);
    try {
      const rootRes = await getRootFolderContentInfo();

      if (rootRes && rootRes.folder && rootRes.folder.length > 0) {
        const rootFolder = rootRes.folder[0];

        // 1. Root ke immediate children load karein
        const childRes = await getFolderContentInfo(rootFolder.uuid);
        // Filter karein taake parent folder children mein dobara na aaye (Duplicate fix)
        const children = (childRes.folder || []).filter((c: any) => c.uuid !== rootFolder.uuid);

        rootFolder.children = children;

        // 2. Sirf ROOT ko expand karein, sab ko nahi
        setExpandedFolders({ [rootFolder.uuid]: true });

        setFolders([rootFolder]);
      }
    } catch (error: any) {
      console.error("Error:", error);
      setToast({ open: true, message: "Failed to load folders", severity: "error" });
    } finally {
      setLoader(false);
    }
  };

  const handleSelect = async (node: any) => {
    setSelectedFolderId(node.uuid);
    setSelectedFolderName(node.path);

    // Agar folder ke children hain lekin abhi tak load nahi huay
    if (node.hasChildren && !node.children) {
      setLoader(true);
      try {
        const res = await getFolderContentInfo(node.uuid);
        // Duplicate filter: Check karein ke API parent ko hi child bana kar to nahi bhej rahi
        const children = (res.folder || []).filter((c: any) => c.uuid !== node.uuid);

        const updateTree = (list: any[]): any[] => {
          return list.map((item) => {
            if (item.uuid === node.uuid) {
              return { ...item, children: children };
            }
            if (item.children) {
              return { ...item, children: updateTree(item.children) };
            }
            return item;
          });
        };

        setFolders((prev) => updateTree(prev));
      } catch (err) {
        console.error("Failed to load children", err);
      } finally {
        setLoader(false);
      }
    }

    // Toggle expand state sirf clicked folder ke liye
    setExpandedFolders((prev) => ({
      ...prev,
      [node.uuid]: !prev[node.uuid]
    }));
  };


  const handleNext = async () => {
    if (!selectedFolderId) {
      setOpen(true); // Show error toast if no folder selected
      return;
    }

    setLoader(true); // Start loader

    try {

      // Filter only file attachments

      if (Selectedfiles.length === 0) {
        setToast({ open: true, message: "No files to upload!", severity: "error" });
        setLoader(false);
        return;
      } else {
        setUploadData({ Selectedfiles, folderUuid: selectedFolderId, folderPath: selectedFolderName });
        setUploadReady(true);
      }


      // Show success toast
      setToast({ open: true, message: "Email and attachments ready for upload!", severity: "success" });
    } catch (err: any) {
      console.error(err);
      setToast({ open: true, message: `Error: ${err.message}`, severity: "error" });
    } finally {
      setLoader(false); // Stop loader
    }
  };


  const handleGetEmail_and_Attachemnts = async () => {
    // if (!selectedFolderId) {
    //   setOpen(true); // Show error toast if no folder selected
    //   return;
    // }

    setLoader(true); // Start loader

    try {
      const subject = Office.context.mailbox.item.subject || "Untitled Email";
      const restId =
        Office.context.mailbox.diagnostics.hostName === "OutlookIOS"
          ? Office.context.mailbox.item.itemId
          : Office.context.mailbox.convertToRestId(
            Office.context.mailbox.item.itemId,
            Office.MailboxEnums.RestVersion.v2_0
          );


      // Get SSO token
      const token: any = await Get_Token_SSO();

      // Fetch email .msg
      const emailResp = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${restId}/$value`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!emailResp.ok) throw new Error("Failed to fetch email content");

      const emailBlob = await emailResp.blob();
      // const emailFile = new File([emailBlob], `${subject}.msg`, { type: "application/vnd.ms-outlook" });
      const emailFile = new File([emailBlob], `${subject}.eml`, {
        type: "message/rfc822",
      });
      // downloadFile(emailFile);
      // Fetch attachments
      const attResp = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${restId}/attachments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!attResp.ok) throw new Error("Failed to fetch email attachments");

      const attData = await attResp.json();

      // Filter only file attachments
      const attachmentFiles: File[] = attData.value
        .filter((att: any) => att["@odata.type"] === "#microsoft.graph.fileAttachment")
        .map(
          (att: any) =>
            new File(
              [Uint8Array.from(atob(att.contentBytes), (c) => c.charCodeAt(0))],
              att.name
            )
        );

      // Combine email + attachments
      const files: File[] = [emailFile, ...attachmentFiles];
      setSelectedfiles(files)
      // Pass to UploadPage


      // Show success toast
      setToast({ open: true, message: "Email and attachments ready for upload!", severity: "success" });
    } catch (err: any) {
      console.error(err);
      setToast({ open: true, message: `Error: ${err.message}`, severity: "error" });
    } finally {
      setLoader(false); // Stop loader
    }
  };



  const handleToastClose = (_event?: any, reason?: string) => {
    if (reason === "clickaway") return;
    setToast({ ...toast, open: false });
  };

  const handleClose = (__event?: any, reason?: string) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Themed colors
  const getBackgroundColor = (nodeId: string) => {
    if (selectedFolderId === nodeId) {
      switch (theme) {
        case "dark": return "#6366f1";
        case "lightgray": return "#9CA3AF";
        default: return "#4f46e5";
      }
    }
    return "transparent";
  };
  const getHoverBackgroundColor = () => {
    switch (theme) {
      case "dark": return "#4f46e5";
      case "lightgray": return "#B0BEC5";
      default: return "#6366f1";
    }
  };
  const getColor = () => {
    switch (theme) {
      case "dark": return "white";
      case "lightgray": return "#374151";
      default: return "black";
    }
  };
  const getTextFieldBackgroundColor = () => {
    switch (theme) {
      case "dark": return "#333";
      case "lightgray": return "#E0E0E0";
      default: return "white";
    }
  };
  const getTreeViewBackgroundColor = () => {
    switch (theme) {
      case "dark": return "#292929";
      case "lightgray": return "#ECEFF1";
      default: return "white";
    }
  };
  const getTreeViewBorderColor = () => {
    switch (theme) {
      case "dark": return "#555";
      case "lightgray": return "#90A4AE";
      default: return "#ddd";
    }
  };
  const getContainerBackgroundColor = () => {
    switch (theme) {
      case "dark": return "#1e1e1e";
      case "lightgray": return "rgb(255 255 255)";
      default: return "rgb(255 255 255)";
    }
  };
  const getTextFieldBorderColor = () => {
    switch (theme) {
      case "dark": return "#757575";
      case "lightgray": return "#BDBDBD";
      default: return "#D3D3D3";
    }
  };
  const getTextFieldHoverBorderColor = () => "#9E9E9E";
  const renderTreeItems = (nodes: any[]) => {
    return nodes.map((node) => (
      <Grow
        key={node.uuid}
        in={true}
        style={{ transformOrigin: "0 0 0", transitionDelay: `${nodes.indexOf(node) * 50}ms` }}
      >
        <TreeItem
          itemId={String(node.uuid)}
          label={
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "4px",
                backgroundColor: getBackgroundColor(node.uuid),
                padding: "8px",
                borderRadius: "8px",
                transition: "all 0.2s ease-in-out",
                "&:hover": { backgroundColor: getHoverBackgroundColor(), color: "white" },
                color: getColor(),
              }}
              onClick={() => handleSelect(node)}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {expandedFolders[node.uuid] ? <FcOpenedFolder /> : <FcFolder />}
                <Typography variant="body2">{node.name}</Typography>
              </Box>
              {/* <IconButton size="small" onClick={() => console.log("Delete", node.uuid)}>
                <MdDelete color="red" size={18} />
              </IconButton> */}
            </Box>
          }
        >
          {node.children && renderTreeItems(node.children)}
        </TreeItem>
      </Grow>
    ));
  };
  const filteredFolders = searchQuery
    ? folders.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : folders;

  const containerStyles = {
    backgroundColor: getContainerBackgroundColor(),
    color: getColor(),
    minHeight: "100vh",
  };

  return (
    <>
      {uploadReady ? (
        <UploadPage
          setUploadRedy={setUploadReady}
          files={uploadData.Selectedfiles}
          folderUuid={uploadData.folderUuid}
          folderPath={uploadData.folderPath}
        />
      ) : (
        <div style={containerStyles} ref={containerRef}>
          <HeaderAppBar Is_Login_Screen={false} />
          {loader && <LoaderApp />}
          <Zoom in={true} style={{ transitionDelay: "100ms" }}>
            <Box sx={{ margin: "10px auto", maxWidth: "600px" }}>
              <Slide direction="down" in={true} style={{ transitionDelay: "200ms" }}>
                <Typography
                  variant="h6"
                  sx={{ textAlign: "center", padding: "10px", fontWeight: "bold", fontSize: "large" }}
                >
                  Available folders in Doccept. Please select one and click on Next.
                </Typography>
              </Slide>
              <Slide direction="up" in={true} style={{ transitionDelay: "300ms" }}>
                <Box sx={{ display: "flex", alignItems: "center", marginBottom: "20px", width: "100%", justifyContent: "center" }}>
                  <TextField
                    size="small"
                    label="Search Folders"
                    placeholder={"search"}
                    sx={{
                      width: "93%",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "25px",
                        backgroundColor: getTextFieldBackgroundColor(),
                        color: getColor(),
                        "& fieldset": { borderColor: getTextFieldBorderColor() },
                        "&:hover fieldset": { borderColor: getTextFieldHoverBorderColor() },
                        "&.Mui-focused fieldset": { borderColor: "#6366f1" },
                      },
                    }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Box>
              </Slide>
              <Slide direction="up" in={true} style={{ transitionDelay: "400ms" }}>
                <TreeView
                  // expandedItems un IDs ki list leta hai jo khuli honi chahiye
                  expandedItems={Object.keys(expandedFolders).filter((key) => expandedFolders[key])}
                  // Is event ko handle karein taake arrow click par bhi toggle ho
                  onItemExpansionToggle={(__event, itemId, isExpanded) => {
                    setExpandedFolders(prev => ({ ...prev, [itemId]: isExpanded }));
                  }}
                  sx={{
                    border: `1px solid ${getTreeViewBorderColor()}`,
                    borderRadius: "8px",
                    padding: "5px",
                    maxHeight: "450px",
                    overflowY: "auto",
                    backgroundColor: getTreeViewBackgroundColor(),
                    color: getColor(),
                    scrollbarWidth: "none",
                    margin: "10px",
                  }}
                >
                  {filteredFolders.length > 0 ? (
                    renderTreeItems(filteredFolders)
                  ) : (
                    <Box sx={{ textAlign: "center", padding: "20px" }}>
                      <ImFileEmpty size={50} color="#ec1764" />
                      <Typography variant="body1" sx={{ marginTop: "10px", fontWeight: "bold" }}>
                        No Folders Available
                      </Typography>
                    </Box>
                  )}
                </TreeView>
              </Slide>
            </Box>
          </Zoom>
          <Slide direction="up" in={true} style={{ transitionDelay: "500ms" }}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button variant="contained" color="primary" sx={{ color: "white", width: "90%" }} onClick={handleNext}>
                Next
              </Button>
            </Box>
          </Slide>
          <Snackbar
            open={toast.open}
            autoHideDuration={4000}
            onClose={handleToastClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert onClose={handleToastClose} severity={toast.severity} sx={{ width: "100%" }}>
              {toast.message}
            </Alert>
          </Snackbar>
        </div>
      )}
    </>
  );
};

export default Home;
