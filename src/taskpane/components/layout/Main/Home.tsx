import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Snackbar,
  Alert,
  Slide,
  Zoom,
  Grow,
} from "@mui/material";
import { TreeItem, TreeView } from "@mui/x-tree-view";
import { FcFolder, FcOpenedFolder } from "react-icons/fc";
import { ImFileEmpty } from "react-icons/im";

import HeaderAppBar from "../Header/HeaderAppBar";
import LoaderApp from "../../Loader/Loader";
import { useTheme } from "../../styles/TheemProvider";
import UploadPage from "./UploadPgae";
import {
  getFolderContentInfo,
  getRootFolderContentInfo,
} from "../../Services/GetRootFolder";
import { Get_Token_SSO } from "../../Services/SSO_For_Graph";

const getFoldersFromResponse = (response: any): any[] => {
  if (Array.isArray(response?.folders)) return response.folders;
  if (Array.isArray(response?.folder)) return response.folder;
  return [];
};

const Home = () => {
  const { theme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedFolderName, setSelectedFolderName] = useState<string | null>(null);

  const [loader, setLoader] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: boolean }>({});
  const [folders, setFolders] = useState<any[]>([]);
  const [Selectedfiles, setSelectedfiles] = useState<any[]>([]);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "success";
  }>({
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

  const containerRef = useRef<HTMLDivElement>(null);

  // Global cache for loaded tree nodes
  const folderCacheRef = useRef<Map<string, any[]>>(new Map());

  // Global searchable tree index
  const allNodesRef = useRef<any[]>([]);

  const normalizeNode = (node: any, children: any[] = []) => ({
    ...node,
    children,
  });

  const indexTree = (nodes: any[]) => {
    allNodesRef.current = nodes;

    const walk = (list: any[]) => {
      for (const node of list) {
        if (node?.uuid && Array.isArray(node.children)) {
          folderCacheRef.current.set(node.uuid, node.children);
          if (node.children.length > 0) {
            walk(node.children);
          }
        }
      }
    };

    walk(nodes);
  };

  const loadChildrenByUuid = async (uuid: string) => {
    const res = await getFolderContentInfo(uuid);
    return getFoldersFromResponse(res).filter((c: any) => c.uuid !== uuid);
  };

  const loadTreeDeep = async (nodes: any[]): Promise<any[]> => {
    return Promise.all(
      nodes.map(async (node) => {
        let children = Array.isArray(node.children) ? node.children : [];

        if (node.hasChildren && children.length === 0) {
          try {
            children = await loadChildrenByUuid(node.uuid);
          } catch (err) {
            console.error("Failed to load children for:", node.uuid, err);
            children = [];
          }
        }

        const deepChildren =
          children.length > 0 ? await loadTreeDeep(children) : [];

        return normalizeNode(node, deepChildren);
      })
    );
  };

  const mergeChildrenIntoTree = (
    list: any[],
    targetUuid: string,
    children: any[]
  ): any[] => {
    return list.map((item) => {
      if (item.uuid === targetUuid) {
        return { ...item, children };
      }

      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: mergeChildrenIntoTree(item.children, targetUuid, children),
        };
      }

      return item;
    });
  };

  useEffect(() => {
    const init = async () => {
      await handleGetRootFolder();
      await handleGetEmail_and_Attachemnts();
    };
    init();
  }, []);


  

  const handleGetRootFolder = async () => {
    setLoader(true);
    try {
      const rootRes = await getRootFolderContentInfo();
      const rootFolders = getFoldersFromResponse(rootRes);

      if (rootFolders.length > 0) {
        const rootFolder = rootFolders[0];

        const rootTree = await loadTreeDeep([rootFolder]);

        // Cache and index the full loaded tree
        folderCacheRef.current.clear();
        indexTree(rootTree);

        setExpandedFolders({ [rootFolder.uuid]: true });
        setFolders(rootTree);
      }
    } catch (error: any) {
      console.error("Error:", error);
      setToast({
        open: true,
        message: "Failed to load folders",
        severity: "error",
      });
    } finally {
      setLoader(false);
    }
  };

  const fetchAndPopulateChildren = async (node: any) => {
    if (node.hasChildren && (!node.children || node.children.length === 0)) {
      setLoader(true);
      try {
        const children = await loadChildrenByUuid(node.uuid);

        // cache loaded children
        folderCacheRef.current.set(node.uuid, children);

        setFolders((prev) => {
          const updated = mergeChildrenIntoTree(prev, node.uuid, children);
          indexTree(updated);
          return updated;
        });
      } catch (err) {
        console.error("Failed to load children", err);
      } finally {
        setLoader(false);
      }
    }
  };

  const handleSelect = async (node: any) => {
    setSelectedFolderId(node.uuid);
    setSelectedFolderName(node.path);

    await fetchAndPopulateChildren(node);

    setExpandedFolders((prev) => ({
      ...prev,
      [node.uuid]: !prev[node.uuid],
    }));
  };

  const filterTreeWithExpandIds = (
    nodes: any[],
    query: string
  ): { nodes: any[]; expandIds: Set<string> } => {
    const q = query.trim().toLowerCase();
    const expandIds = new Set<string>();

    if (!q) {
      return { nodes, expandIds };
    }

    const filter = (list: any[]): any[] => {
      return list.reduce((acc: any[], node) => {
        const isMatch = String(node.name || "")
          .toLowerCase()
          .includes(q);

        const filteredChildren = Array.isArray(node.children)
          ? filter(node.children)
          : [];

        if (isMatch || filteredChildren.length > 0) {
          if (filteredChildren.length > 0) {
            expandIds.add(node.uuid);
          }

          acc.push({
            ...node,
            children: filteredChildren,
          });
        }

        return acc;
      }, []);
    };

    const result = filter(nodes);
    return { nodes: result, expandIds };
  };

  const { nodes: filteredFolders, expandIds: searchExpandIds } = useMemo(() => {
    return filterTreeWithExpandIds(allNodesRef.current, searchQuery);
  }, [folders, searchQuery]);

  const treeExpandedItems = useMemo(() => {
    const manualExpanded = Object.keys(expandedFolders).filter(
      (key) => expandedFolders[key]
    );

    return Array.from(new Set([...manualExpanded, ...Array.from(searchExpandIds)]));
  }, [expandedFolders, searchExpandIds]);

  const handleNext = async () => {
    if (!selectedFolderId) {
      setToast({
        open: true,
        message: "Please select a folder first",
        severity: "error",
      });
      return;
    }

    setLoader(true);
    try {
      if (Selectedfiles.length === 0) {
        setToast({ open: true, message: "No files to upload!", severity: "error" });
        return;
      }

      setUploadData({
        Selectedfiles,
        folderUuid: selectedFolderId,
        folderPath: selectedFolderName!,
      });
      setUploadReady(true);

      setToast({
        open: true,
        message: "Email and attachments ready for upload!",
        severity: "success",
      });
    } catch (err: any) {
      console.error(err);
      setToast({ open: true, message: `Error: ${err.message}`, severity: "error" });
    } finally {
      setLoader(false);
    }
  };

  // const handleGetEmail_and_Attachemnts = async () => {
  //   setLoader(true);
  //   try {
  //     const subject = Office.context.mailbox.item.subject || "Untitled Email";

  //     const restId =
  //       Office.context.mailbox.diagnostics.hostName === "OutlookIOS"
  //         ? Office.context.mailbox.item.itemId
  //         : Office.context.mailbox.convertToRestId(
  //             Office.context.mailbox.item.itemId,
  //             Office.MailboxEnums.RestVersion.v2_0
  //           );

  //     const token: any = await Get_Token_SSO();

  //     const emailResp = await fetch(
  //       `https://graph.microsoft.com/v1.0/me/messages/${restId}/$value`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     if (!emailResp.ok) throw new Error("Failed to fetch email content");

  //     const emailBlob = await emailResp.blob();
  //     const emailFile = new File([emailBlob], `${subject}.eml`, {
  //       type: "message/rfc822",
  //     });

  //     const attResp = await fetch(
  //       `https://graph.microsoft.com/v1.0/me/messages/${restId}/attachments`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     if (!attResp.ok) throw new Error("Failed to fetch email attachments");

  //     const attData = await attResp.json();

  //     const attachmentFiles: File[] = attData.value
  //       .filter((att: any) => att["@odata.type"] === "#microsoft.graph.fileAttachment")
  //       .map((att: any) => {
  //         return new File(
  //           [Uint8Array.from(atob(att.contentBytes), (c) => c.charCodeAt(0))],
  //           att.name
  //         );
  //       });

  //     const files: File[] = [emailFile, ...attachmentFiles];
  //     setSelectedfiles(files);

  //     setToast({
  //       open: true,
  //       message: "Email and attachments ready for upload!",
  //       severity: "success",
  //     });
  //   } catch (err: any) {
  //     console.error(err);
  //     setToast({ open: true, message: `Error: ${err.message}`, severity: "error" });
  //   } finally {
  //     setLoader(false);
  //   }
  // };

const handleGetEmail_and_Attachemnts = async () => {
  setLoader(true);
  try {
    const sanitize = (name: string) => name.replace(/[\\/:*?"<>|]/g, '_');
    const subject = Office.context.mailbox.item.subject || "Untitled Email";
    const cleanSubject = sanitize(subject);

    // --- 1. Get Email (.eml) from Graph API ---
    const restId =
      Office.context.mailbox.diagnostics.hostName === "OutlookIOS"
        ? Office.context.mailbox.item.itemId
        : Office.context.mailbox.convertToRestId(
            Office.context.mailbox.item.itemId,
            Office.MailboxEnums.RestVersion.v2_0
          );

    const token: any = await Get_Token_SSO();
    const emailResp = await fetch(
      `https://graph.microsoft.com/v1.0/me/messages/${restId}/$value`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!emailResp.ok) throw new Error("Failed to fetch email content");
    const emailBlob = await emailResp.blob();
    const emailFile: any = new File([emailBlob], `${cleanSubject}.eml`, { type: "message/rfc822" });
    emailFile.isMainEmail = true; // Identify as main email

    // --- 2. Get Attachments from Office.js ---
    const getAttachments = (): Promise<File[]> => {
      return new Promise((resolve, reject) => {
        // Get all attachment metadata
        const item = Office.context.mailbox.item;
        const attachmentsMetadata = item.attachments;

        if (!attachmentsMetadata || attachmentsMetadata.length === 0) {
          resolve([]);
          return;
        }

        const attachmentPromises = attachmentsMetadata.filter((att: any) => !att.isInline).map((att: any) => {
          return new Promise<File>((res) => {
            // Har attachment ka content base64 mein mangwayein
            item.getAttachmentContentAsync(att.id, (result) => {
              if (result.status === Office.AsyncResultStatus.Succeeded) {
                // Base64 string ko bytes mein convert karein
                const base64Content = result.value.content;
                const byteCharacters = atob(base64Content);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);

                const cleanAttName = sanitize(att.name);
                const fileObj: any = new File([byteArray], cleanAttName, { type: att.contentType });
                
                // Identify properties
                fileObj.isInline = att.isInline; // true if it's a signature image
                fileObj.isMainEmail = false;

                res(fileObj);
              }
            });
          });
        });

        Promise.all(attachmentPromises).then(resolve).catch(reject);
      });
    };

    const attachmentFiles = await getAttachments();

    // Combine both
    const allFiles: File[] = [emailFile, ...attachmentFiles];
    setSelectedfiles(allFiles);

    setToast({ open: true, message: "Email & Attachments ready!", severity: "success" });
 setToast({
        open: true,
        message: "Email and attachments ready for upload!",
        severity: "success",
      });
  } catch (err: any) {
    console.error(err);
    setToast({ open: true, message: `Error: ${err.message}`, severity: "error" });
  } finally {
    setLoader(false);
  }
};

  const handleToastClose = (_event?: any, reason?: string) => {
    if (reason === "clickaway") return;
    setToast({ ...toast, open: false });
  };

  const getBackgroundColor = (nodeId: string) => {
    if (selectedFolderId === nodeId) {
      switch (theme) {
        case "dark":
          return "#6366f1";
        case "lightgray":
          return "#9CA3AF";
        default:
          return "#4f46e5";
      }
    }
    return "transparent";
  };

  const getHoverBackgroundColor = () => {
    switch (theme) {
      case "dark":
        return "#4f46e5";
      case "lightgray":
        return "#B0BEC5";
      default:
        return "#6366f1";
    }
  };

  const getColor = () => {
    switch (theme) {
      case "dark":
        return "white";
      case "lightgray":
        return "#374151";
      default:
        return "black";
    }
  };

  const getTextFieldBackgroundColor = () => {
    switch (theme) {
      case "dark":
        return "#333";
      case "lightgray":
        return "#E0E0E0";
      default:
        return "white";
    }
  };

  const getTreeViewBackgroundColor = () => {
    switch (theme) {
      case "dark":
        return "#292929";
      case "lightgray":
        return "#ECEFF1";
      default:
        return "white";
    }
  };

  const getTreeViewBorderColor = () => {
    switch (theme) {
      case "dark":
        return "#555";
      case "lightgray":
        return "#90A4AE";
      default:
        return "#ddd";
    }
  };

  const getContainerBackgroundColor = () => {
    switch (theme) {
      case "dark":
        return "#1e1e1e";
      case "lightgray":
        return "rgb(255 255 255)";
      default:
        return "rgb(255 255 255)";
    }
  };

  const getTextFieldBorderColor = () => {
    switch (theme) {
      case "dark":
        return "#757575";
      case "lightgray":
        return "#BDBDBD";
      default:
        return "#D3D3D3";
    }
  };

  const getTextFieldHoverBorderColor = () => "#9E9E9E";

  const renderTreeItems = (nodes: any[]) => {
    return nodes.map((node, index) => (
      <Grow
        key={node.uuid}
        in={true}
        style={{ transformOrigin: "0 0 0", transitionDelay: `${index * 50}ms` }}
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
                "&:hover": {
                  backgroundColor: getHoverBackgroundColor(),
                  color: "white",
                },
                color: getColor(),
              }}
              onClick={() => handleSelect(node)}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {expandedFolders[node.uuid] ? <FcOpenedFolder /> : <FcFolder />}
                <Typography variant="body2">{node.name}</Typography>
              </Box>
            </Box>
          }
        >
          {node.children && node.children.length > 0
            ? renderTreeItems(node.children)
            : node.hasChildren ? (
                <TreeItem
                  itemId={`${node.uuid}-loading`}
                  label="Loading..."
                  sx={{ display: "none" }}
                />
              ) : null}
        </TreeItem>
      </Grow>
    ));
  };

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
          files={uploadData!.Selectedfiles}
          folderUuid={uploadData!.folderUuid}
          folderPath={uploadData!.folderPath}
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
                  sx={{
                    textAlign: "center",
                    padding: "10px",
                    fontWeight: "bold",
                    fontSize: "large",
                  }}
                >
                  Available folders in Doccept. Please select one and click on Next.
                </Typography>
              </Slide>

              <Slide direction="up" in={true} style={{ transitionDelay: "300ms" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "20px",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
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
                  expandedItems={treeExpandedItems}
                  onItemExpansionToggle={(__event, itemId, isExpanded) => {
                    setExpandedFolders((prev) => ({
                      ...prev,
                      [itemId]: isExpanded,
                    }));

                    if (isExpanded) {
                      const findNode = (nodes: any[]): any => {
                        for (const n of nodes) {
                          if (n.uuid === itemId) return n;
                          if (n.children && n.children.length > 0) {
                            const found = findNode(n.children);
                            if (found) return found;
                          }
                        }
                        return null;
                      };

                      const node = findNode(folders);
                      if (node) fetchAndPopulateChildren(node);
                    }
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
              <Button
                variant="contained"
                color="primary"
                sx={{ color: "white", width: "90%" }}
                onClick={handleNext}
              >
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