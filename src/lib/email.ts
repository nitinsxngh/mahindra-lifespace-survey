import nodemailer from "nodemailer";

export interface SurveyChoice {
  priority: number;
  name: string;
  rate: number;
  remark: string;
}

export interface ConfirmationEmailPayload {
  to: string;
  name: string;
  phone: string;
  unitNumber: string;
  tower: string;
  choices: SurveyChoice[];
  submittedAt: Date;
}

function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  );
}

function formatChoices(choices: SurveyChoice[]): string {
  return choices
    .sort((a, b) => a.priority - b.priority)
    .map(
      (c) =>
        `${c.priority}. ${c.name}: ₹${c.rate.toLocaleString("en-IN")} ${c.remark}`
    )
    .join("\n");
}

function buildConfirmationHtml(payload: ConfirmationEmailPayload): string {
  const choiceRows = payload.choices
    .sort((a, b) => a.priority - b.priority)
    .map(
      (c) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-weight:700;color:#E31837;">${c.priority}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#2e2e2e;">${c.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#4D4D4D;">₹${c.rate.toLocaleString("en-IN")} ${c.remark}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#2e2e2e;">
    <h2 style="color:#E31837;margin-bottom:8px;">Survey Confirmation</h2>
    <p style="margin:0 0 16px;">Dear ${payload.name || "Resident"},</p>
    <p style="margin:0 0 16px;">
      Thank you for completing the Mahindra Happinest Palghar amenity survey.
      We have received your preferences successfully.
    </p>
    <div style="background:#f7f7f7;border-radius:10px;padding:14px 16px;margin-bottom:18px;">
      <p style="margin:0 0 6px;"><strong>Mobile:</strong> +91 ${payload.phone}</p>
      ${payload.unitNumber ? `<p style="margin:0 0 6px;"><strong>Unit:</strong> ${payload.unitNumber}</p>` : ""}
      ${payload.tower ? `<p style="margin:0;"><strong>Tower:</strong> ${payload.tower}</p>` : ""}
    </div>
    <h3 style="margin:0 0 10px;">Your selected amenities</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:18px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:10px 12px;background:#fde6e9;color:#861023;">Priority</th>
          <th style="text-align:left;padding:10px 12px;background:#fde6e9;color:#861023;">Amenity</th>
          <th style="text-align:left;padding:10px 12px;background:#fde6e9;color:#861023;">Cost</th>
        </tr>
      </thead>
      <tbody>
        ${choiceRows}
      </tbody>
    </table>
    <p style="margin:0 0 8px;font-size:13px;color:#6b6b6b;">
      Submitted on ${payload.submittedAt.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })}.
    </p>
    <p style="margin:0;font-size:13px;color:#6b6b6b;">
      This is an automated confirmation email. Please do not reply.
    </p>
  </div>`;
}

export async function sendSurveyConfirmationEmail(
  payload: ConfirmationEmailPayload
): Promise<void> {
  const subject = "Mahindra Happinest Palghar - Survey Confirmation";
  const text = [
    `Dear ${payload.name || "Resident"},`,
    "",
    "Thank you for completing the amenity survey. Your responses have been recorded.",
    "",
    `Mobile: +91 ${payload.phone}`,
    payload.unitNumber ? `Unit: ${payload.unitNumber}` : "",
    payload.tower ? `Tower: ${payload.tower}` : "",
    "",
    "Your selected amenities:",
    formatChoices(payload.choices),
    "",
    `Submitted on ${payload.submittedAt.toLocaleString("en-IN")}.`,
  ]
    .filter(Boolean)
    .join("\n");

  if (!isSmtpConfigured()) {
    console.log("[EMAIL] SMTP not configured. Confirmation email preview:");
    console.log(`To: ${payload.to}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    return;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    process.env.SMTP_SECURE === "true" || port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: payload.to,
    subject,
    text,
    html: buildConfirmationHtml(payload),
  });
}
