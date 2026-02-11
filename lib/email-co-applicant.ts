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

interface CoApplicantInvitationEmailProps {
  email: string;
  coApplicantName: string;
  primaryTenantName: string;
  listingTitle: string;
  invitationToken: string;
  applicationId: string;
  isVerification?: boolean; // Si true, c'est pour vérifier les infos remplies par le principal
}

export async function sendCoApplicantInvitation({
  email,
  coApplicantName,
  primaryTenantName,
  listingTitle,
  invitationToken,
  applicationId,
  isVerification = false,
}: CoApplicantInvitationEmailProps) {
  console.log('📧 Tentative d\'envoi d\'email d\'invitation co-applicant:', {
    to: email,
    coApplicantName,
    listingTitle,
    isVerification,
    hasApiKey: !!process.env.RESEND_API_KEY,
    resendInitialized: !!resend,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const invitationUrl = `${baseUrl}/co-applicant/${invitationToken}?applicationId=${applicationId}`;

  // Si pas de clé API, on log juste (pour le développement)
  if (!process.env.RESEND_API_KEY || !resend) {
    console.log('\n⚠️  ============================================');
    console.log('⚠️  MODE DÉVELOPPEMENT - EMAIL NON ENVOYÉ');
    console.log('⚠️  ============================================');
    console.log('📧 Email d\'invitation co-applicant qui aurait été envoyé:');
    console.log('   Destinataire:', email);
    console.log('   Sujet:', isVerification 
      ? `Vérification de vos informations - ${listingTitle}`
      : `Invitation à compléter votre candidature - ${listingTitle}`);
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
    
    const subject = isVerification
      ? `Vérification de vos informations - ${listingTitle}`
      : `Invitation à compléter votre candidature - ${listingTitle}`;

    const mainMessage = isVerification
      ? `
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
          <strong>${primaryTenantName}</strong> a rempli vos informations pour la candidature au logement suivant. Veuillez vérifier et valider ces informations :
        </p>
      `
      : `
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
          <strong>${primaryTenantName}</strong> vous invite à compléter votre candidature pour le logement suivant :
        </p>
      `;

    const buttonText = isVerification
      ? "Vérifier mes informations"
      : "Compléter ma candidature";

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${isVerification ? 'Vérification' : 'Invitation'} - Co-applicant</title>
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
                          ${isVerification ? '🔍 Vérification' : '👥 Invitation'} - Co-applicant
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                          Bonjour <strong>${coApplicantName}</strong>,
                        </p>
                        
                        ${mainMessage}
                        
                        <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #1e293b;">
                          <h2 style="margin: 0 0 10px 0; color: #1e293b; font-size: 20px; font-weight: 300;">
                            ${listingTitle}
                          </h2>
                        </div>
                        
                        <p style="margin: 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                          ${isVerification
                            ? "Cliquez sur le bouton ci-dessous pour vérifier les informations qui ont été remplies en votre nom et les valider si elles sont correctes."
                            : "Pour compléter votre candidature, créez votre compte en cliquant sur le bouton ci-dessous. Vous serez automatiquement redirigé vers le formulaire de candidature."
                          }
                        </p>
                        
                        <div style="margin: 30px 0; text-align: center;">
                          <a href="${invitationUrl}" 
                             style="display: inline-block; padding: 14px 28px; background: #1e293b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 300; font-size: 16px;">
                            ${buttonText}
                          </a>
                        </div>
                        
                        <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          Ce lien est valide pendant 7 jours. Si vous avez des questions, n'hésitez pas à contacter le locataire principal ou le propriétaire.
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

