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
  const [userLogin] = useState("Noman");
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
  const fetchChildrenRecursively = async (folder: any) => {
    if (folder.hasChildren) {
      const res = await getFolderContentInfo(folder.uuid);
      folder.children = res.folder || [];
      for (let child of folder.children) {
        await fetchChildrenRecursively(child);
      }
    }
  };

  const handleGetRootFolder = async () => {
    setLoader(true);
    try {
      const rootFolderData = await getRootFolderContentInfo();
      const rootFolder = rootFolderData.folder[0];

      await fetchChildrenRecursively(rootFolder);

      setFolders([rootFolder]);
      // console.log("Root folder with children:", rootFolder);
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setLoader(false);
    }
  };

  const handleSelect = (node: any) => {
    setSelectedFolderId(node.uuid);
    setSelectedFolderName(node.path);
    // console.log("Selected Folder Name:", node.name);
    // console.log("Selected Folder ID:", node.uuid);

    setExpandedFolders((prev) => ({ ...prev, [node.uuid]: !prev[node.uuid] }));
  };

  // Inside Home.tsx

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
      }else{
      setUploadData({Selectedfiles, folderUuid: selectedFolderId, folderPath: selectedFolderName });
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
                  sx={{
                    border: `1px solid ${getTreeViewBorderColor()}`,
                    borderRadius: "8px",
                    padding: "5px",
                    maxHeight: "310px",
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
