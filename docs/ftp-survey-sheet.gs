/* Passion to Profit survey -> Google Sheet.
 *
 * Bound to the sheet "Passion to Profit: survey responses". The site route (api/ftp-survey.js in
 * independenc3/passion-refresh) posts each completed survey here, and this appends one row.
 *
 * SETUP (about two minutes, by someone who can edit the sheet):
 *  1. Open the sheet > Extensions > Apps Script. Delete the sample code and paste this whole file. Save.
 *  2. Project Settings (gear) > Script properties > Add script property:
 *       SHARED_TOKEN = a long random string you make up (at least 32 characters)
 *  3. Deploy > New deployment > type "Web app":
 *       Execute as: Me      Who has access: Anyone
 *     Authorise when asked, then copy the Web app URL (it ends in /exec).
 *  4. In the Vercel project passion-refresh > Settings > Environment Variables (Production), add:
 *       GOOGLE_SHEET_WEBHOOK_URL   = the Web app URL from step 3
 *       GOOGLE_SHEET_WEBHOOK_TOKEN = the same string you used for SHARED_TOKEN
 *     then redeploy. Check: https://start.passion.io/ftp-survey-capture should show "sink":"google-sheet".
 *
 * "Anyone" only means the URL needs no Google sign-in; without the right token every request is
 * refused and nothing is written. To rotate the token, change it here and in Vercel together.
 */

var TOKEN_PROPERTY = 'SHARED_TOKEN';

function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return reply_({ ok: false, error: 'bad body' }); }

  var token = PropertiesService.getScriptProperties().getProperty(TOKEN_PROPERTY);
  if (!token || body.token !== token) return reply_({ ok: false, error: 'forbidden' });

  var a = body.answers || {};
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  // column order matches the header row: Submitted, Social, Offer, Current income, Desired income, Challenge, Page, HubSpot cookie
  sheet.appendRow([body.submitted || '', a.social || '', a.offer || '', a.income || '', a.desired || '', a.challenge || '', body.page || '', body.hutk || '']);
  return reply_({ ok: true });
}

// Opening the URL in a browser is a harmless health check.
function doGet() { return reply_({ ok: true, service: 'passion-to-profit-survey' }); }

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
