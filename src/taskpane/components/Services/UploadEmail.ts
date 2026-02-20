export async function createMail(token, mail) {
  try {
    const response = await fetch('https://your-api-endpoint.com/mails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mail),
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (errorData.error === 'PathNotFoundException') {
        throw new Error('Parent folder does not exist.');
      } else if (errorData.error === 'ItemExistsException') {
        throw new Error('A mail with the same name already exists in this path.');
      } else {
        throw new Error(`Failed to create mail: ${response.status} ${response.statusText}`);
      }
    }

    const createdMail = await response.json();
    return createdMail;

  } catch (error) {
    console.error('Error creating mail:', error.message);
    throw error;
  }
}
