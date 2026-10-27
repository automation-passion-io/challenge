/* Passion to Profit survey -> Google Sheet.
 *
 * The site route (api/ftp-survey.js in independenc3/passion-refresh) posts each completed survey
 * here, and this appends one row to the sheet "Passion to Profit: survey responses".
 * Requests without the right SHARED_TOKEN (a script property) are refused and write nothing.
 *
 * SETUP (already done once, in the project "Untitled project" under ashley.couto@passion.io):
 *  1. script.google.com > New project. Paste this file. Save.
 *  2. Project Settings > Script properties > add SHARED_TOKEN = a long random string.
 *  3. Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone > Deploy > Allow.
 *     Copy the Web app URL (ends in /exec).
 *  4. In Vercel (project passion-refresh, Production) set GOOGLE_SHEET_WEBHOOK_URL = that URL and
 *     GOOGLE_SHEET_WEBHOOK_TOKEN = the same string as SHARED_TOKEN, then redeploy.
 *     Check: https://start.passion.io/ftp-survey-capture shows "sink":"google-sheet".
 * "Anyone" only means no Google sign-in is needed; without the token every request is refused.
 * To rotate the token, change it here and in Vercel together. Never put the token in this file.
 */

var TOKEN_PROPERTY = 'SHARED_TOKEN';
var SHEET_ID = '1-41DNe-oqAQ2rUk7qFUACr2Z2Bfx_syaQQsKnbq5vyg';   // Passion to Profit: survey responses

function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return reply_({ ok: false, error: 'bad body' }); }

  var token = PropertiesService.getScriptProperties().getProperty(TOKEN_PROPERTY);
  if (!token || body.token !== token) return reply_({ ok: false, error: 'forbidden' });

  var a = body.answers || {};
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  // column order matches the header row: Submitted, Social, Offer, Current income, Desired income, Challenge, Page, HubSpot cookie
  sheet.appendRow([body.submitted || '', a.social || '', a.offer || '', a.income || '', a.desired || '', a.challenge || '', body.page || '', body.hutk || '']);
  return reply_({ ok: true });
}

// Opening the URL in a browser is a harmless health check.
function doGet() { return reply_({ ok: true, service: 'passion-to-profit-survey' }); }

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
