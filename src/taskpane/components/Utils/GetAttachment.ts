 export const getAttachments = (): Promise<File[]> => {
    return new Promise((resolve, reject) => {
        const item = Office.context.mailbox.item as Office.MessageRead;

        if (item.attachments.length > 0) {
            const attachmentsPromises = item.attachments.map((attachment) => {
                return new Promise<File>((resolve, reject) => {
                    Office.context.mailbox.item.getAttachmentContentAsync(attachment.id, (result) => {
                        if (result.status === Office.AsyncResultStatus.Succeeded) {
                            const attachmentContent = result.value;
                            const base64 = attachmentContent.content;
                            const byteCharacters = atob(base64);
                            const byteNumbers = new Array(byteCharacters.length);
                            for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], { type: attachmentContent.format === Office.MailboxEnums.AttachmentContentFormat.Base64 ? 'application/octet-stream' : attachmentContent.format });
                            const file = new File([blob], attachment.name, { type: blob.type });
                            resolve(file);
                        } else {
                            reject(new Error(`Failed to get attachment content: ${result.error.message}`));
                        }
                    });
                });
            });
            Promise.all(attachmentsPromises)
                .then((files) => {
                    resolve(files);
                })
                .catch((error) => {
                    reject(error);
                });
        } else {
            resolve([]);
        }
    });
};
