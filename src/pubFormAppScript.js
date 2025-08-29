// ====== CONFIG: set these to your IDs ======
const SPREADSHEET_ID = '13SJXm56cXiCrzquuhovWGiVfTnzVmnMkVReLq3aS_OM';
const DRIVE_FOLDER_ID = '1dehs1hBh_GUFhvjFZle3SvVNUPFyYFz2';
// ==========================================

/**
 * Handle GET actions:
 *  - action=reserve&category=PP  -> returns reserved publication number (and reserves a row)
 *  - action=list&category=PP     -> optional: returns sheet rows (for debugging)
 */
function doGet(e) {
    try {
        var action = (e && e.parameter && e.parameter.action) || '';
        if (action === 'reserve') {
            var category = (e.parameter.category || '').trim();
            if (!category) return _jsonError('Missing category');

            var number = reservePublicationNumber_(category);
            return ContentService.createTextOutput(JSON.stringify({ success: true, number: number }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        if (action === 'list') {
            var category = (e.parameter.category || 'PP').trim();
            var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
            var sheet = ss.getSheetByName(categoryToSheetName_(category));
            if (!sheet) return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'sheet not found' })).setMimeType(ContentService.MimeType.JSON);
            var rows = sheet.getDataRange().getValues();
            return ContentService.createTextOutput(JSON.stringify({ success: true, rows })).setMimeType(ContentService.MimeType.JSON);
        }

        return ContentService.createTextOutput('OK');
    } catch (err) {
        return _jsonError(err && err.message);
    }
}

/**
 * doPost: accepts metadata + fileContent (base64) + publicationNo (reserved).
 * Saves merged PDF to Drive, updates the sheet row (the reserved row) with metadata + fileUrl + status.
 *
 * Expected form fields (multipart/form-data):
 *  - publicationNo  (the reserved number from /?action=reserve)
 *  - category
 *  - author, email, title, abstract, jelcode, keywords, acknow
 *  - fileContent (base64 string of final merged PDF)
 *  - fileType (usually 'application/pdf')
 */
function doPost(e) {
    var lock = LockService.getScriptLock();
    try {
        lock.waitLock(30000);

        // Apps Script exposes form fields in e.parameter
        var params = e.parameter || {};
        var publicationNo = (params.publicationNo || '').trim();
        var category = (params.category || '').trim();
        var author = params.author || '';
        var email = params.email || '';
        var title = params.title || '';
        var abstract = params.abstract || '';
        var jelcode = params.jelcode || '';
        var keywords = params.keywords || '';
        var acknow = params.acknow || '';
        var fileContent = params.fileContent || ''; // base64
        var fileType = params.fileType || 'application/pdf';

        if (!publicationNo) return _jsonError('Missing publicationNo');
        if (!fileContent) return _jsonError('Missing fileContent');

        // Decode base64 -> blob
        var bytes = Utilities.base64Decode(fileContent);
        var blob = Utilities.newBlob(bytes, fileType, publicationNo + '.pdf');

        // Save to Drive
        var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        var fileUrl = file.getUrl();

        // Update sheet row (find reserved row by publicationNo)
        var sheetName = categoryToSheetName_(category);
        var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        var sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
            // fallback: put into a default sheet (or create)
            return _jsonError('Sheet not found for category: ' + category);
        }

        // Find row where column A == publicationNo
        var data = sheet.getDataRange().getValues(); // 2D array
        var foundRow = -1;
        for (var r = 1; r < data.length; r++) { // start r=1 to skip header row
            if (String(data[r][0]) === publicationNo) {
                foundRow = r + 1; // sheet rows are 1-indexed
                break;
            }
        }

        var now = new Date();
        var rowValues = [
            publicationNo,         // A: publication number
            author,                // B
            email,                 // C
            title,                 // D
            abstract,              // E
            jelcode,               // F
            keywords,              // G
            acknow,                // H
            fileUrl,               // I
            now,                   // J: date
            'UPLOADED'             // K: status
        ];

        if (foundRow > 0) {
            sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
        } else {
            // If reservation row not found (edge case), append a fresh row
            sheet.appendRow(rowValues);
        }

        return ContentService.createTextOutput(JSON.stringify({ success: true, fileUrl: fileUrl }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return _jsonError(err && err.message);
    } finally {
        try { lock.releaseLock(); } catch (_) { }
    }
}

/* ------------------------ Helper functions ------------------------ */

function _jsonError(msg) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: msg || 'unknown' })).setMimeType(ContentService.MimeType.JSON);
}

/** Reserve the next publication number and append a 'RESERVED' row immediately */
function reservePublicationNumber_(category) {
    var lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
        var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        var sheetName = categoryToSheetName_(category);
        var sheet = ss.getSheetByName(sheetName);
        if (!sheet) throw new Error('Sheet not found: ' + sheetName);

        var year = new Date().getFullYear();
        var prefix = category + '-' + year + '-';

        var maxSeq = 0;
        if (sheet.getLastRow() > 1) {
            var vals = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat();
            vals.forEach(function (v) {
                if (typeof v === 'string' && v.indexOf(prefix) === 0) {
                    var parts = v.split('-');
                    var seq = parseInt(parts[2], 10);
                    if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
                }
            });
        }

        var newSeq = maxSeq + 1;
        var padded = ('000' + newSeq).slice(-3);
        var publicationNo = prefix + padded;

        // Append a reservation row: keep cells blank except number + timestamp + status
        var now = new Date();
        sheet.appendRow([publicationNo, '', '', '', '', '', '', '', '', now, 'RESERVED']);

        return publicationNo;
    } finally {
        try { lock.releaseLock(); } catch (_) { }
    }
}

/** Map category code -> sheet name */
function categoryToSheetName_(category) {
    switch (String(category).toUpperCase()) {
        case 'PP': return 'PP Series';
        case 'WP': return 'WP Series';
        case 'MN': return 'MN Series';
        case 'BR': return 'Book Review';
        default: throw new Error('Unknown category: ' + category);
    }
}
