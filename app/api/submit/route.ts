import { NextRequest, NextResponse } from 'next/server';
import { createClient, FileStat } from 'webdav';
import * as XLSX from 'xlsx';

// Define the expected structure of an entry from the frontend
type Entry = {
  date: string;
  store: string;
  amount: number | '';
  paymentMethod: string;
  notes: string;
};

export async function POST(req: NextRequest) {
  try {
    // 1. Read credentials and path from environment variables
    const { WEBDAV_URL, WEBDAV_USERNAME, WEBDAV_PASSWORD, SPREADSHEET_PATH } = process.env;

    if (!WEBDAV_URL || !WEBDAV_USERNAME || !WEBDAV_PASSWORD || !SPREADSHEET_PATH) {
      console.error('WebDAV environment variables are not set');
      return NextResponse.json(
        { message: 'サーバー設定が不完全です。 (WebDAV environment variables are not set)' },
        { status: 500 }
      );
    }

    // 2. Get the data from the request body
    const entries: Entry[] = await req.json();
    if (!entries || entries.length === 0) {
      return NextResponse.json({ message: 'データが空です。' }, { status: 400 });
    }

    // 3. Connect to WebDAV server
    const client = createClient(WEBDAV_URL, {
      username: WEBDAV_USERNAME,
      password: WEBDAV_PASSWORD,
    });

    // 4. Download the ODS file
    console.log(`Downloading spreadsheet from: ${SPREADSHEET_PATH}`);
    if (!(await client.exists(SPREADSHEET_PATH))) {
         console.error(`Spreadsheet file not found at: ${SPREADSHEET_PATH}`);
         return NextResponse.json(
             { message: `スプレッドシートファイルが見つかりません: ${SPREADSHEET_PATH}`},
             { status: 404 }
         );
    }
    const fileContent = (await client.getFileContents(SPREADSHEET_PATH)) as Buffer;
    console.log('Spreadsheet downloaded successfully.');

    // 5. Parse the spreadsheet using XLSX
    // XLSX.set_fs(fs); // This is not needed in this environment
    const workbook = XLSX.read(fileContent, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // 6. Append the new data to the sheet
    const newRows = entries.map(entry => [
      entry.date,
      entry.store,
      entry.amount,
      entry.paymentMethod,
      entry.notes,
    ]);

    XLSX.utils.sheet_add_aoa(worksheet, newRows, { origin: -1 }); // -1 means append to the end
    console.log('New data appended to the worksheet.');

    // 7. Write the updated workbook back to a buffer
    const updatedFileContent = XLSX.write(workbook, { type: 'buffer', bookType: 'ods' });
    console.log('Workbook updated and converted to ODS buffer.');

    // 8. Upload the updated file back to WebDAV
    await client.putFileContents(SPREADSHEET_PATH, updatedFileContent, {
      overwrite: true,
    });
    console.log('Spreadsheet uploaded successfully.');

    return NextResponse.json({
      message: `${entries.length}件のデータを追加しました。`,
    });
  } catch (error) {
    console.error('An error occurred:', error);
    // Provide a more specific error message if possible
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { message: 'データの処理中にエラーが発生しました。', error: errorMessage },
      { status: 500 }
    );
  }
}
