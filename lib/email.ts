import { Resend } from 'resend';

// Initialiser Resend seulement si la clé API est disponible
let resend: Resend | null = null;
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (error) {
  console.warn('Impossible d\'initialiser Resend:', error);
}

interface WelcomeEmailProps {
  name: string;
  email: string;
  role: 'TENANT' | 'LANDLORD';
}

export async function sendWelcomeEmail({ name, email, role }: WelcomeEmailProps) {
  console.log('📧 Tentative d\'envoi d\'email de bienvenue:', {
    to: email,
    name,
    role,
    hasApiKey: !!process.env.RESEND_API_KEY,
    resendInitialized: !!resend,
  });

  // Si pas de clé API, on log juste (pour le développement)
  if (!process.env.RESEND_API_KEY || !resend) {
    console.log('\n⚠️  ============================================');
    console.log('⚠️  MODE DÉVELOPPEMENT - EMAIL NON ENVOYÉ');
    console.log('⚠️  ============================================');
    console.log('📧 Email de bienvenue qui aurait été envoyé:');
    console.log('   Destinataire:', email);
    console.log('   Sujet:', `Bienvenue sur MyRent, ${name} ! 🏠`);
    console.log('   Nom:', name);
    console.log('   Rôle:', role);
    console.log('\n💡 Pour recevoir de vrais emails:');
    console.log('   1. Créez un compte sur https://resend.com');
    console.log('   2. Obtenez votre clé API');
    console.log('   3. Ajoutez RESEND_API_KEY dans votre fichier .env');
    console.log('   4. Redémarrez le serveur');
    console.log('   📖 Voir CONFIGURATION_EMAIL.md pour plus de détails\n');
    return { success: true, id: 'dev-mode' };
  }

  try {
    const roleLabel = role === 'TENANT' ? 'locataire' : 'propriétaire';
    const roleDescription = role === 'TENANT' 
      ? 'Vous pouvez maintenant rechercher des logements, créer votre dossier locataire et postuler aux annonces qui vous intéressent.'
      : 'Vous pouvez maintenant publier vos annonces, gérer vos candidatures et communiquer avec les locataires.';

    if (!resend) {
      console.log('📧 Email de bienvenue (mode développement - Resend non initialisé):', {
        to: email,
        name,
        role,
      });
      return { success: true, id: 'dev-mode' };
    }

    // Utiliser onboarding@resend.dev pour les tests (limité à l'adresse vérifiée du compte)
    // Pour la production, vérifiez un domaine sur resend.com/domains
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'MyRent <onboarding@resend.dev>';
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Bienvenue sur MyRent, ${name} ! 🏠`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenue sur MyRent</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 40px 20px; text-align: center;">
                  <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #141414 0%, #171717 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                          🏠 Bienvenue sur MyRent !
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                          Bonjour <strong>${name}</strong>,
                        </p>
                        
                        <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                          Nous sommes ravis de vous accueillir sur MyRent ! Votre compte a été créé avec succès en tant que <strong>${roleLabel}</strong>.
                        </p>
                        
                        <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                          ${roleDescription}
                        </p>
                        
                        <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #141414;">
                          <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Prochaines étapes :</strong>
                          </p>
                          <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                            ${role === 'TENANT' 
                              ? `
                                <li>Complétez votre profil locataire</li>
                                <li>Créez votre dossier de candidature</li>
                                <li>Explorez les annonces disponibles</li>
                                <li>Postulez aux logements qui vous intéressent</li>
                              `
                              : `
                                <li>Complétez votre profil propriétaire</li>
                                <li>Publiez votre première annonce</li>
                                <li>Gérez vos candidatures</li>
                                <li>Communiquez avec les locataires</li>
                              `
                            }
                          </ul>
                        </div>
                        
                        <div style="margin: 30px 0; text-align: center;">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${role === 'TENANT' ? 'tenant' : 'landlord'}/dashboard" 
                             style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #141414 0%, #171717 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Accéder à mon tableau de bord
                          </a>
                        </div>
                        
                        <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          Si vous avez des questions, n'hésitez pas à nous contacter. Nous sommes là pour vous aider !
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
      
      // Message d'erreur spécifique pour les emails de test Resend
      if (error.statusCode === 403 && error.message?.includes('testing emails')) {
        console.error('\n⚠️  LIMITATION RESEND - MODE TEST');
        console.error('   Resend ne permet d\'envoyer des emails de test qu\'à votre adresse vérifiée.');
        console.error('   Pour envoyer à d\'autres adresses:');
        console.error('   1. Allez sur https://resend.com/domains');
        console.error('   2. Vérifiez votre domaine');
        console.error('   3. Utilisez une adresse @votredomaine.com comme expéditeur');
        console.error('   📖 Voir CONFIGURATION_EMAIL.md pour plus de détails\n');
      }
      
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return { success: false, error };
  }
}

