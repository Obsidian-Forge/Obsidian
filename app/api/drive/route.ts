import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

// YENİ YÖNTEM: SERVICE ACCOUNT YERİNE OAUTH2 (Kotayı Kendi Gmail'inden Alır)
const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

// Sürekli yenilenen ve süresi geçmeyen token
auth.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const drive = google.drive({ version: 'v3', auth });

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, clientName, clientEmail, folderId, fileName, htmlContent, fileUrl, folderType } = body;
        const parentId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

        // --- ACTION 1: CREATE FOLDER STRUCTURE ---
        if (action === 'createClientFolders') {
            const mainFolder = await drive.files.create({
                requestBody: { name: `Novatrum - ${clientName}`, mimeType: 'application/vnd.google-apps.folder', parents: [parentId!] },
                fields: 'id, webViewLink'
            });

            const mainId = mainFolder.data.id;

            if (clientEmail) {
                await drive.permissions.create({
                    fileId: mainId!,
                    requestBody: { role: 'writer', type: 'user', emailAddress: clientEmail },
                    sendNotificationEmail: false 
                });
            }

            const subFolders = ['Invoices', 'Technical Documents', 'Assets'];
            const folderIds: Record<string, string> = {};

            for (const sub of subFolders) {
                const folder = await drive.files.create({
                    requestBody: { name: sub, mimeType: 'application/vnd.google-apps.folder', parents: [mainId!] },
                    fields: 'id'
                });
                folderIds[sub] = folder.data.id!;
            }

            return NextResponse.json({ success: true, mainId, driveLink: mainFolder.data.webViewLink, invoiceFolderId: folderIds['Invoices'] });
        }

        // --- ACTION 2: UPLOAD FILE FROM SUPABASE TO DRIVE ---
        if (action === 'uploadFileFromUrl') {
            const folderMapping: Record<string, string> = {
                'asset': 'Assets', 'technical': 'Technical Documents', 'invoice': 'Invoices'
            };
            const targetSubFolder = folderMapping[folderType] || 'Assets';
            const safeClientName = (clientName || 'Unknown').replace(/'/g, "\\'");

            // 1. Ana Klasörü Ara
            const mainFolderQuery = `name = 'Novatrum - ${safeClientName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
            const mainFolderRes = await drive.files.list({ q: mainFolderQuery, fields: 'files(id)', spaces: 'drive' });
            
            let mainFolderId = null;

            if (!mainFolderRes.data.files || mainFolderRes.data.files.length === 0) {
                const newMain = await drive.files.create({
                    requestBody: { name: `Novatrum - ${clientName}`, mimeType: 'application/vnd.google-apps.folder', parents: [parentId!] },
                    fields: 'id'
                });
                mainFolderId = newMain.data.id;

                const subFolders = ['Invoices', 'Technical Documents', 'Assets'];
                for (const sub of subFolders) {
                    await drive.files.create({ requestBody: { name: sub, mimeType: 'application/vnd.google-apps.folder', parents: [mainFolderId!] }, fields: 'id' });
                }
            } else {
                mainFolderId = mainFolderRes.data.files[0].id;
            }

            // 3. Alt Klasörü Ara
            const subFolderQuery = `name = '${targetSubFolder}' and '${mainFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
            const subFolderRes = await drive.files.list({ q: subFolderQuery, fields: 'files(id)', spaces: 'drive' });

            let finalFolderId = mainFolderId;
            
            if (subFolderRes.data.files && subFolderRes.data.files.length > 0) {
                 finalFolderId = subFolderRes.data.files[0].id;
            } else {
                 const newSub = await drive.files.create({
                    requestBody: { name: targetSubFolder, mimeType: 'application/vnd.google-apps.folder', parents: [mainFolderId!] },
                    fields: 'id'
                 });
                 finalFolderId = newSub.data.id;
            }

            // 5. Dosyayı Supabase'den İndir ve Drive'a Aktar
            const fileRes = await fetch(fileUrl);
            if (!fileRes.ok) throw new Error("Supabase dosya indirme hatası.");

            const arrayBuffer = await fileRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const driveFile = await drive.files.create({
                 requestBody: { name: fileName, parents: [finalFolderId!] },
                 media: { mimeType: fileRes.headers.get('content-type') || 'application/octet-stream', body: Readable.from(buffer) },
                 fields: 'id, webViewLink'
            });

            return NextResponse.json({ success: true, link: driveFile.data.webViewLink });
        }

        return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

    } catch (error: any) {
        console.error('--- DRIVE API ERROR ---', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}