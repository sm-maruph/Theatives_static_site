/*
 * Paste this file into script.google.com and follow GOOGLE-SHEETS-SETUP.md.
 * Set SPREADSHEET_ID from the destination Google Sheet URL.
 */

const NOTIFICATION_EMAIL = 'theatives@gmail.com';
const SPREADSHEET_ID = '14XkulhMpjlcsPF85NfsCvRcm80lVwbhN78N5e5CqNn8';
const SHEET_NAME = 'Client Enquiries';

// Run this once from the Apps Script editor to authorize and verify Sheet access.
function testSheetConnection() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);

  sheet.getRange(1, 1, 1, 7).setValues([[
    'Received', 'Email', 'Contact', 'Message', 'Page', 'Browser timestamp', 'Mobile / WhatsApp'
  ]]);
  sheet.appendRow([
    new Date(),
    'connection-test@theatives.local',
    'Apps Script connection test',
    'If you can see this row, the spreadsheet connection is working.',
    'Apps Script editor',
    new Date().toISOString(),
    ''
  ]);

  console.log('Success: wrote to ' + spreadsheet.getUrl());
}

function doPost(e) {
  try {
    const data = e.parameter || {};

    // Bots commonly fill hidden fields. Return normally so they do not retry.
    if (data.website) return response_({ ok: true });

    const email = clean_(data.email);
    const contact = clean_(data.contact);
    const mobile = clean_(data.mobile);
    const message = clean_(data.message);

    if (!email || !contact || !message) {
      return response_({ ok: false, error: 'Missing required fields' });
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.setFrozenRows(1);
    }

    sheet.getRange(1, 1, 1, 7).setValues([[
      'Received', 'Email', 'Contact', 'Message', 'Page', 'Browser timestamp', 'Mobile / WhatsApp'
    ]]);

    sheet.appendRow([
      new Date(),
      safeCell_(email),
      safeCell_(contact),
      safeCell_(message),
      safeCell_(clean_(data.page)),
      safeCell_(clean_(data.submittedAt)),
      safeCell_(mobile)
    ]);

    const htmlEmail = buildEmailHtml_({
      contact: contact,
      email: email,
      mobile: mobile,
      message: message,
      page: clean_(data.page)
    });

    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      replyTo: email,
      subject: 'New website enquiry from ' + contact,
      body: [
        'A new enquiry was submitted on the Theatives website.',
        '',
        'Contact: ' + contact,
        'Email: ' + email,
        'Mobile / WhatsApp: ' + (mobile || 'Not provided'),
        '',
        'Message:',
        message,
        '',
        'Page: ' + clean_(data.page)
      ].join('\n'),
      htmlBody: htmlEmail,
      name: 'Theatives Website'
    });

    return response_({ ok: true });
  } catch (error) {
    console.error(error);
    return response_({ ok: false, error: String(error) });
  }
}

function buildEmailHtml_(data) {
  const contact = escapeHtml_(data.contact);
  const email = escapeHtml_(data.email);
  const mobile = escapeHtml_(data.mobile || 'Not provided');
  const message = escapeHtml_(data.message).replace(/\n/g, '<br>');
  const page = escapeHtml_(data.page || 'Website contact form');
  const emailHref = encodeURIComponent(data.email);
  const whatsappNumber = String(data.mobile || '').replace(/\D/g, '');
  const whatsappButton = whatsappNumber
    ? '<a href="https://wa.me/' + whatsappNumber + '" style="display:inline-block;margin:0 8px 8px 0;padding:12px 18px;border-radius:999px;background:#b7ff2a;color:#0c0d0f;text-decoration:none;font:700 13px Arial,sans-serif;">Open WhatsApp</a>'
    : '';

  return '<!doctype html>' +
    '<html><body style="margin:0;padding:0;background:#eceff1;color:#15171a;font-family:Arial,Helvetica,sans-serif;">' +
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eceff1;padding:28px 12px;">' +
        '<tr><td align="center">' +
          '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#0d0f12;border-radius:18px;overflow:hidden;box-shadow:0 12px 35px rgba(0,0,0,.16);">' +
            '<tr><td style="padding:30px 34px;border-bottom:1px solid #292d32;">' +
              '<div style="color:#ffffff;font-size:25px;font-weight:800;letter-spacing:-1px;">THEATIVES<span style="color:#b7ff2a;">®</span></div>' +
              '<div style="margin-top:8px;color:#8f979f;font-size:11px;letter-spacing:2px;text-transform:uppercase;">New website enquiry</div>' +
            '</td></tr>' +
            '<tr><td style="padding:34px;">' +
              '<h1 style="margin:0 0 8px;color:#ffffff;font-size:27px;line-height:1.2;">New enquiry from ' + contact + '</h1>' +
              '<p style="margin:0 0 28px;color:#9da4ab;font-size:14px;">A potential client submitted the contact form.</p>' +
              infoRow_('EMAIL', email) +
              infoRow_('MOBILE / WHATSAPP', mobile) +
              '<div style="margin:25px 0;padding:22px;background:#171a1e;border:1px solid #292e34;border-radius:12px;">' +
                '<div style="margin-bottom:10px;color:#b7ff2a;font-size:10px;font-weight:700;letter-spacing:1.5px;">MESSAGE</div>' +
                '<div style="color:#f4f5f6;font-size:16px;line-height:1.65;">' + message + '</div>' +
              '</div>' +
              '<div style="margin-top:26px;">' +
                '<a href="mailto:' + emailHref + '" style="display:inline-block;margin:0 8px 8px 0;padding:12px 18px;border:1px solid #4a5159;border-radius:999px;color:#ffffff;text-decoration:none;font:700 13px Arial,sans-serif;">Reply by email</a>' +
                whatsappButton +
              '</div>' +
              '<div style="margin-top:25px;padding-top:18px;border-top:1px solid #292d32;color:#737b83;font-size:11px;line-height:1.5;word-break:break-all;">Submitted from: ' + page + '</div>' +
            '</td></tr>' +
          '</table>' +
        '</td></tr>' +
      '</table>' +
    '</body></html>';
}

function infoRow_(label, value) {
  return '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:13px;">' +
    '<tr><td style="width:155px;color:#7f878f;font-size:10px;font-weight:700;letter-spacing:1.3px;">' + label + '</td>' +
    '<td style="color:#ffffff;font-size:14px;">' + value + '</td></tr></table>';
}

function escapeHtml_(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clean_(value) {
  return String(value || '').trim().slice(0, 10000);
}

// Prevent spreadsheet-formula injection from user-entered values.
function safeCell_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function response_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
