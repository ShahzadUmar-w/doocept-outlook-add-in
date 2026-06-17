import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Slide,
  Zoom,
  Grow,
} from "@mui/material";
import { TreeItem, TreeView } from "@mui/x-tree-view";
import { FcFolder, FcOpenedFolder } from "react-icons/fc";
import { ImFileEmpty } from "react-icons/im";
import { MdChevronRight, MdExpandMore } from "react-icons/md";
import toast from 'react-hot-toast';

import HeaderAppBar from "../Header/HeaderAppBar";
import LoaderApp from "../../Loader/Loader";
import { useTheme } from "../../styles/TheemProvider";
import UploadPage from "./UploadPgae";
import {
  getFolderContentInfo,
  getRootFolderContentInfo,
} from "../../Services/GetRootFolder";
import { Get_Token_SSO } from "../../Services/SSO_For_Graph";
import { Toast } from "@fluentui/react-components";

const getFoldersFromResponse = (response: any): any[] => {
  if (Array.isArray(response?.folders)) return response.folders;
  if (Array.isArray(response?.folder)) return response.folder;
  return [];
};

const Home = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedFolderName, setSelectedFolderName] = useState<string | null>(null);

  const [loader, setLoader] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: boolean }>({});
  const [folders, setFolders] = useState<any[]>([]);
  const [Selectedfiles, setSelectedfiles] = useState<any[]>([]);

  const [uploadReady, setUploadReady] = useState(false);
  const [uploadData, setUploadData] = useState<{
    Selectedfiles: any[]; folderUuid: string; folderPath: string;
  } | null>(null);

  // --- API LOGIC ---
  const loadChildrenByUuid = async (uuid: string) => {
    const res = await getFolderContentInfo(uuid);
    return getFoldersFromResponse(res).filter((c: any) => c.uuid !== uuid);
  };

  const mergeChildrenIntoTree = (list: any[], targetUuid: string, children: any[]): any[] => {
    return list.map((item) => {
      if (item.uuid === targetUuid) return { ...item, children };
      if (item.children && item.children.length > 0) {
        return { ...item, children: mergeChildrenIntoTree(item.children, targetUuid, children) };
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
        const mainRoot = rootFolders[0];
        const subfolders = await loadChildrenByUuid(mainRoot.uuid);
        setFolders(subfolders.map(f => ({ ...f, children: [] })));
      }
    } catch (error) {
      toast.error("Failed to load folders");
    } finally {
      setLoader(false);
    }
  };

  const fetchAndPopulateChildren = async (node: any) => {
    if (node.hasChildren && (!node.children || node.children.length === 0)) {
      setLoader(true);
      try {
        const children = await loadChildrenByUuid(node.uuid);
        setFolders((prev) => mergeChildrenIntoTree(prev, node.uuid, children));
      } catch (err) {
        toast.error("Error loading subfolders");
      } finally {
        setLoader(false);
      }
    }
  };

  const handleSelect = async (node: any) => {
    setSelectedFolderId(node.uuid);
    setSelectedFolderName(node.path);
    await fetchAndPopulateChildren(node);
  };

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
            item.getAttachmentContentAsync(att.id, (result:any) => {
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

    // setToast({ open: true, message: "Email & Attachments ready!", severity: "success" });
     toast.success(`Email & Attachments ready!`);
  } catch (err: any) {
    console.error(err);
    toast.success(`Error: ${err.message}`);
  } finally {
    setLoader(false);
  }
};
  const handleNext = () => {
    if (!selectedFolderId) {
      toast.error("Please select a folder first");
      return;
    }
    setUploadData({ Selectedfiles, folderUuid: selectedFolderId, folderPath: selectedFolderName! });
    setUploadReady(true);
  };

  // --- SEARCH & FILTER LOGIC ---
  const { filteredNodes, autoExpandIds } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const expandIds = new Set<string>();
    if (!q) return { filteredNodes: folders, autoExpandIds: [] };

    const filterNodes = (nodes: any[]): any[] => {
      return nodes.reduce((acc: any[], node) => {
        const isMatch = node.name.toLowerCase().includes(q);
        const children = node.children ? filterNodes(node.children) : [];
        if (isMatch || children.length > 0) {
          if (children.length > 0) expandIds.add(node.uuid);
          acc.push({ ...node, children });
        }
        return acc;
      }, []);
    };
    return { filteredNodes: filterNodes(folders), autoExpandIds: Array.from(expandIds) };
  }, [folders, searchQuery]);

  const treeExpandedItems = useMemo(() => {
    const manualExpanded = Object.keys(expandedFolders).filter((key) => expandedFolders[key]);
    return Array.from(new Set([...manualExpanded, ...autoExpandIds]));
  }, [expandedFolders, autoExpandIds]);

  const renderTreeItems = (nodes: any[]) => {
    return nodes.map((node, index) => (
      <Grow key={node.uuid} in={true} style={{ transitionDelay: `${index * 30}ms` }}>
        <TreeItem
          itemId={String(node.uuid)}
          sx={{
            "& .MuiTreeItem-content": {
              padding: "4px 8px", borderRadius: "10px", margin: "2px 0",
              "&.Mui-selected": {
                backgroundColor: "#5c5cf1 !important", // Indigo background from screenshot
                color: "white !important",
              },
            },
            "& .MuiTreeItem-iconContainer": { width: "25px" }
          }}
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px", height: "40px" }} onClick={() => handleSelect(node)}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {expandedFolders[node.uuid] ? <FcOpenedFolder size={24} /> : <FcFolder size={24} />}
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: selectedFolderId === node.uuid ? "bold" : "500", 
                  color: selectedFolderId === node.uuid ? "white" : (isDark ? "#f0f0f0" : "#333"), // Fixed visibility
                  fontSize: "13px"
                }}
              >
                {node.name}
              </Typography>
            </Box>
          }
        >
          {node.children && node.children.length > 0 ? renderTreeItems(node.children) : null}
        </TreeItem>
      </Grow>
    ));
  };

  return (
    <>
      {uploadReady ? (
        <UploadPage setUploadRedy={setUploadReady} files={uploadData!.Selectedfiles} folderUuid={uploadData!.folderUuid} folderPath={uploadData!.folderPath} />
      ) : (
        <Box sx={{ backgroundColor: isDark ? "#1e1e1e" : "#f5f5f5", minHeight: "100vh" }}>
          <HeaderAppBar Is_Login_Screen={false} />
          {loader && <LoaderApp />}

          <Box sx={{ margin: "0 auto", maxWidth: "400px", p: 1 }}>
            <Typography variant="h6" sx={{ textAlign: "center", mb: 3, fontWeight: "bold", color: isDark ? "white" : "black" }}>
              Select Destination Folder
            </Typography>

            <TextField
              fullWidth
              size="small"
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "25px",
                  backgroundColor: isDark ? "#333" : "white",
                  color: isDark ? "white" : "black",
                  "& fieldset": { borderColor: isDark ? "#444" : "#ddd" },
                  "&.Mui-focused fieldset": { borderColor: "#c81355" },
                },
                "& .MuiInputBase-input::placeholder": { color: isDark ? "#888" : "#999" }
              }}
            />

            <Box sx={{
                border: `1px solid ${isDark ? "#444" : "#ddd"}`,
                borderRadius: "15px",
                p: 1, height: "420px", overflowY: "auto",
                backgroundColor: isDark ? "#292929" : "#fff",
                overflow: "auto",
                scrollbarWidth: "none",
            }}>
              <TreeView
                expandedItems={treeExpandedItems}
                onItemExpansionToggle={(__event, itemId, isExpanded) => {
                  setExpandedFolders(prev => ({ ...prev, [itemId]: isExpanded }));
                  if (isExpanded) {
                    const findNode = (list: any[]): any => {
                        for (const n of list) {
                          if (n.uuid === itemId) return n;
                          if (n.children?.length) {
                             const res = findNode(n.children);
                             if(res) return res;
                          }
                        }
                    };
                    const node = findNode(folders);
                    if (node) fetchAndPopulateChildren(node);
                  }
                }}
                // defaultCollapseIcon={<MdExpandMore size={22} color={isDark ? "white" : "black"} />}
                // defaultExpandIcon={<MdChevronRight size={22} color={isDark ? "white" : "black"} />}
                // defaultEndIcon={<Box sx={{ width: 22 }} />}
                
              >
                {filteredNodes.length > 0 ? renderTreeItems(filteredNodes) : (
                  <Box sx={{ textAlign: "center", mt: 10 }}>
                    <ImFileEmpty size={40} color="#666" />
                    <Typography sx={{ color: "#888", mt: 2 }}>No Folders</Typography>
                  </Box>
                )}
              </TreeView>
            </Box>

            <Button 
              fullWidth 
              variant="contained" 
              onClick={handleNext} 
              sx={{ 
                mt: 3, py: 1.5, borderRadius: "10px", 
                textTransform: "none", fontWeight: "bold", 
                backgroundColor: "#c81355", // Magenta/Pink from screenshot
                "&:hover": { backgroundColor: "#f03278" } 
              }}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Home;