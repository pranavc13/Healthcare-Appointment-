// Shared inline-styled HTML shell so every email looks consistent with the app's
// blue/indigo gradient theme without depending on any external stylesheet or CDN.
function renderEmail({ heading, bodyHtml, ctaLabel, ctaUrl }) {
  const cta = ctaUrl
    ? `<tr><td style="padding:24px 32px 8px 32px;" align="center">
         <a href="${ctaUrl}" style="background:linear-gradient(90deg,#2563eb,#4f46e5);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:12px;display:inline-block;">${ctaLabel}</a>
       </td></tr>`
    : '';

  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <tr>
    <td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
        <tr>
          <td style="background:linear-gradient(90deg,#2563eb,#4f46e5,#7c3aed);padding:22px 32px;">
            <span style="color:#ffffff;font-weight:900;font-size:18px;letter-spacing:-0.02em;">Jeevan Chakra</span>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 4px 32px;">
            <h1 style="margin:0 0 12px 0;font-size:20px;color:#0f172a;">${heading}</h1>
            <div style="font-size:14px;line-height:1.7;color:#334155;">${bodyHtml}</div>
          </td>
        </tr>
        ${cta}
        <tr>
          <td style="padding:24px 32px 28px 32px;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">This is an automated message from Jeevan Chakra. Please do not reply to this email.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

module.exports = { renderEmail };
