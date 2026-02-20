  // Themed colors
 export const GetBackgroundColor = (nodeId: string ,selectedFolderId:any,theme:any) => {
    if (selectedFolderId === nodeId) {
      switch (theme) {
        case "dark": return "#6366f1";
        case "lightgray": return "#9CA3AF";
        default: return "#4f46e5";
      }
    }
    return "transparent";
  };