import { Resend } from "resend";
import sgMail from "@sendgrid/mail";
import crypto from "crypto";
import { getAppUrl } from "@/lib/app-url";

let resend: Resend | null = null;
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (error) {
  console.warn("Impossible d'initialiser Resend:", error);
}

interface InvitationEmailProps {
  email: string;
  landlordName: string | null;
  listingTitle: string;
  invitationToken?: string;
  applicationId?: string;
  invitationUrl?: string;
}

function invitationHtml({
  email,
  landlordName,
  listingTitle,
  invitationUrl,
}: {
  email: string;
  landlordName: string | null;
  listingTitle: string;
  invitationUrl: string;
}) {
  const who = landlordName ? `<strong>${landlordName}</strong>` : "Un propriétaire";
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation MyRent</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff;">
                <tr>
                  <td style="padding: 36px 32px 16px; color: #171717; font-size: 28px; font-weight: 300;">
                    MyRent.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 32px 32px; color: #404040; font-size: 16px; line-height: 1.6; font-weight: 300;">
                    <p>${who} vous invite à ouvrir votre dossier pour :</p>
                    <p style="font-size: 20px; color: #171717;">${listingTitle}</p>
                    <p style="margin: 28px 0;">
                      <a href="${invitationUrl}" style="display: inline-block; padding: 14px 28px; background: #171717; color: #ffffff; text-decoration: none; border-radius: 999px;">
                        Ouvrir le dossier
                      </a>
                    </p>
                    <p style="color: #737373; font-size: 14px;">Le lien est valable 14 jours.</p>
                    <p style="color: #a3a3a3; font-size: 12px;">Envoyé à ${email}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function sendApplicationInvitation({
  email,
  landlordName,
  listingTitle,
  invitationToken,
  applicationId,
  invitationUrl,
}: InvitationEmailProps) {
  const baseUrl = getAppUrl();
  const url =
    invitationUrl ||
    (applicationId
      ? `${baseUrl}/invite/${invitationToken}?applicationId=${applicationId}`
      : `${baseUrl}/invite/${invitationToken}`);

  const subject = `Invitation MyRent — ${listingTitle}`;
  const text = `${landlordName || "Un propriétaire"} vous invite à ouvrir votre dossier pour ${listingTitle}.\n\n${url}`;
  const html = invitationHtml({ email, landlordName, listingTitle, invitationUrl: url });

  if (process.env.SENDGRID_API_KEY) {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const fromEmail =
        process.env.SENDGRID_FROM_EMAIL ||
        process.env.SENDGRID_VERIFIED_EMAIL ||
        "noreply@myrent.app";
      await sgMail.send({
        to: email,
        from: { email: fromEmail, name: "MyRent" },
        subject,
        text,
        html,
      });
      return { success: true, provider: "sendgrid" as const };
    } catch (error) {
      console.error("[invite email] SendGrid:", error);
    }
  }

  if (process.env.RESEND_API_KEY && resend) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || "MyRent <onboarding@resend.dev>";
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject,
        html,
      });
      if (error) {
        console.error("[invite email] Resend:", error);
        return { success: false, error };
      }
      return { success: true, provider: "resend" as const, id: data?.id };
    } catch (error) {
      console.error("[invite email] Resend:", error);
      return { success: false, error };
    }
  }

  console.warn("[invite email] Aucune clé SendGrid/Resend — courriel non envoyé:", email, url);
  return { success: false, skipped: true, invitationUrl: url };
}

export function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
