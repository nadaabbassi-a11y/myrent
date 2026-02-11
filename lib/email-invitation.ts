import { Resend } from 'resend';
import crypto from 'crypto';

// Initialiser Resend seulement si la clé API est disponible
let resend: Resend | null = null;
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (error) {
  console.warn('Impossible d\'initialiser Resend:', error);
}

interface InvitationEmailProps {
  email: string;
  landlordName: string | null;
  listingTitle: string;
  invitationToken: string;
  applicationId?: string;
}

export async function sendApplicationInvitation({
  email,
  landlordName,
  listingTitle,
  invitationToken,
  applicationId,
}: InvitationEmailProps) {
  console.log('📧 Tentative d\'envoi d\'email d\'invitation:', {
    to: email,
    listingTitle,
    hasApiKey: !!process.env.RESEND_API_KEY,
    resendInitialized: !!resend,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const invitationUrl = applicationId
    ? `${baseUrl}/invite/${invitationToken}?applicationId=${applicationId}`
    : `${baseUrl}/invite/${invitationToken}`;

  // Si pas de clé API, on log juste (pour le développement)
  if (!process.env.RESEND_API_KEY || !resend) {
    console.log('\n⚠️  ============================================');
    console.log('⚠️  MODE DÉVELOPPEMENT - EMAIL NON ENVOYÉ');
    console.log('⚠️  ============================================');
    console.log('📧 Email d\'invitation qui aurait été envoyé:');
    console.log('   Destinataire:', email);
    console.log('   Sujet:', `Invitation à postuler - ${listingTitle}`);
    console.log('   Lien:', invitationUrl);
    console.log('\n💡 Pour recevoir de vrais emails:');
    console.log('   1. Créez un compte sur https://resend.com');
    console.log('   2. Obtenez votre clé API');
    console.log('   3. Ajoutez RESEND_API_KEY dans votre fichier .env');
    console.log('   4. Redémarrez le serveur\n');
    return { success: true, id: 'dev-mode' };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'MyRent <onboarding@resend.dev>';
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Invitation à postuler - ${listingTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invitation à postuler</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 40px 20px; text-align: center;">
                  <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: #1e293b; padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 300;">
                          🏠 Invitation à postuler
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                          Bonjour,
                        </p>
                        
                        <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                          ${landlordName ? `<strong>${landlordName}</strong>` : 'Un propriétaire'} vous invite à postuler pour le logement suivant :
                        </p>
                        
                        <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #1e293b;">
                          <h2 style="margin: 0 0 10px 0; color: #1e293b; font-size: 20px; font-weight: 300;">
                            ${listingTitle}
                          </h2>
                        </div>
                        
                        <p style="margin: 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                          Pour postuler, créez votre compte en cliquant sur le bouton ci-dessous. Vous serez automatiquement redirigé vers la page de candidature.
                        </p>
                        
                        <div style="margin: 30px 0; text-align: center;">
                          <a href="${invitationUrl}" 
                             style="display: inline-block; padding: 14px 28px; background: #1e293b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 300; font-size: 16px;">
                            Créer mon compte et postuler
                          </a>
                        </div>
                        
                        <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          Ce lien est valide pendant 7 jours. Si vous avez des questions, n'hésitez pas à contacter le propriétaire.
                        </p>
                        
                        <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          Cordialement,<br>
                          <strong>L'équipe MyRent</strong>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px;">
                          MyRent - Plateforme de location à long terme
                        </p>
                        <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                          Cet email a été envoyé à ${email}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return { success: false, error };
  }
}

export function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

