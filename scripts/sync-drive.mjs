import fs from 'fs';
import path from 'path';

async function syncFolder(folderId, outputDir) {
  // If you didn't add a folder ID to your settings yet, the robot skips it safely
  if (!folderId) {
    console.log(`Skipping: No Folder ID set for ${outputDir}`);
    return;
  }

  console.log(`Checking Google Drive Folder: ${folderId}...`);
  
  // We look into your folder public stream
  try {
    const url = `https://googleapis.com{folderId}'+in+parents+and+trashed=false&key=${process.env.GOOGLE_API_KEY || ''}`;
    const response = await fetch(url);
    
    // If the system limits the request, we create a fallback layout placeholder so it doesn't crash
    if (!response.ok) {
      console.log("Drive communication paused. Creating standard empty folder layout structure...");
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      return;
    }

    const data = await response.json();
    const files = data.files || [];

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // For every file it finds in your Google Drive, it builds a neat page for your website
    for (const file of files) {
      const fileName = file.name.replace(/\.[^/.]+\$/, "") + ".md";
      const filePath = path.join(outputDir, fileName);

      if (!fs.existsSync(filePath)) {
        const content = `---\ntitle: "${file.name.replace(/\.[^/.]+$/, "")}"\ndescription: "Resource pulled from synced directory folder."\ndate: "${new Date().toISOString().split('T')[0]}"\n---\n\nThis resource is synced and accessible via your shared folder link.`;
        fs.writeFileSync(filePath, content);
        console.log(`Created website card for: ${file.name}`);
      }
    }
  } catch (error) {
    console.error(`Error syncing folder:`, error);
  }
}

async function main() {
  await syncFolder(process.env.DRIVE_BOOKS_FOLDER_ID, 'src/content/books');
  await syncFolder(process.env.DRIVE_RESOURCES_FOLDER_ID, 'src/content/resources');
}

main();
