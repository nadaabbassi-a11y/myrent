import sgMail from '@sendgrid/mail';

// Initialiser SendGrid seulement si la clé API est disponible
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface WelcomeEmailProps {
  name: string;
  email: string;
  role: 'TENANT' | 'LANDLORD';
}

export async function sendWelcomeEmail({ name, email, role }: WelcomeEmailProps) {
  console.log('📧 Tentative d\'envoi d\'email de bienvenue (SendGrid):', {
    to: email,
    name,
    role,
    hasApiKey: !!process.env.SENDGRID_API_KEY,
  });

  // Si pas de clé API, on log juste (pour le développement)
  if (!process.env.SENDGRID_API_KEY) {
    console.log('\n⚠️  ============================================');
    console.log('⚠️  MODE DÉVELOPPEMENT - EMAIL NON ENVOYÉ');
    console.log('⚠️  ============================================');
    console.log('📧 Email de bienvenue qui aurait été envoyé:');
    console.log('   Destinataire:', email);
    console.log('   Sujet:', `Bienvenue sur MyRent, ${name} ! 🏠`);
    console.log('   Nom:', name);
    console.log('   Rôle:', role);
    console.log('\n💡 Pour recevoir de vrais emails:');
    console.log('   1. Créez un compte sur https://sendgrid.com');
    console.log('   2. Obtenez votre clé API');
    console.log('   3. Ajoutez SENDGRID_API_KEY dans votre fichier .env');
    console.log('   4. Redémarrez le serveur');
    console.log('   📖 Voir CONFIGURATION_EMAIL.md pour plus de détails\n');
    return { success: true, id: 'dev-mode' };
  }

  try {
    const roleLabel = role === 'TENANT' ? 'locataire' : 'propriétaire';
    const roleDescription = role === 'TENANT' 
      ? 'Vous pouvez maintenant rechercher des logements, créer votre dossier locataire et postuler aux annonces qui vous intéressent.'
      : 'Vous pouvez maintenant publier vos annonces, gérer vos candidatures et communiquer avec les locataires.';

    // SendGrid nécessite une adresse email vérifiée
    // Vérifiez votre email dans SendGrid: Settings → Sender Authentication → Single Sender Verification
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.SENDGRID_VERIFIED_EMAIL || 'noreply@myrent.app';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const msg = {
      to: email,
      from: {
        email: fromEmail,
        name: 'MyRent',
      },
      replyTo: fromEmail, // Ajouter un reply-to pour améliorer la délivrabilité
      subject: `Bienvenue sur MyRent, ${name} ! 🏠`,
      // Catégorie pour le tracking SendGrid
      categories: ['welcome-email'],
      // En-têtes personnalisés pour améliorer la délivrabilité
      customArgs: {
        type: 'welcome',
        role: role,
      },
      // Options de délivrabilité
      mailSettings: {
        // Désactiver le tracking de clics pour éviter les filtres spam
        clickTracking: {
          enable: false,
        },
        // Désactiver le tracking d'ouverture
        openTracking: {
          enable: false,
        },
        // Activer le sandbox mode en développement (optionnel)
        sandboxMode: {
          enable: process.env.NODE_ENV === 'development' ? false : false,
        },
      },
      // Version texte pour améliorer la délivrabilité
      text: `Bienvenue sur MyRent, ${name} !

Votre compte a été créé avec succès en tant que ${roleLabel}.

${roleDescription}

Prochaines étapes :
${role === 'TENANT' 
  ? '- Complétez votre profil locataire\n- Créez votre dossier de candidature\n- Explorez les annonces disponibles\n- Postulez aux logements qui vous intéressent'
  : '- Complétez votre profil propriétaire\n- Publiez votre première annonce\n- Gérez vos candidatures\n- Communiquez avec les locataires'
}

Accéder à mon tableau de bord : ${appUrl}/${role === 'TENANT' ? 'tenant' : 'landlord'}/dashboard

Si vous avez des questions, n'hésitez pas à nous contacter.

Cordialement,
L'équipe MyRent`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <title>Bienvenue sur MyRent</title>
            <!-- Précharger les polices pour éviter les problèmes d'affichage -->
            <style>
              @media only screen and (max-width: 600px) {
                .container { width: 100% !important; }
              }
            </style>
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
                          <a href="${appUrl}/${role === 'TENANT' ? 'tenant' : 'landlord'}/dashboard" 
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
    };

    const [response] = await sgMail.send(msg);

    return { success: true, id: response.headers['x-message-id'] || 'sent' };
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    
    if (error.response) {
      console.error('Détails de l\'erreur SendGrid:', error.response.body);
    }
    
    return { success: false, error };
  }
}

