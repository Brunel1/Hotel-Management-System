import nodemailer from 'nodemailer'

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Fonction pour envoyer un email
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Gestion Hôtelière" <noreply@gestionhotel.com>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Version texte brut
    })

    console.log('Email envoyé:', info.messageId)
    return true
  } catch (error) {
    console.error('Erreur lors de l&apos;envoi de l&apos;email:', error)
    return false
  }
}

/**
 * Email de confirmation de réservation
 */
export async function sendBookingConfirmationEmail(
  email: string,
  firstName: string,
  lastName: string,
  roomNumber: string,
  roomType: string,
  checkIn: string,
  checkOut: string,
  totalPrice: number
): Promise<boolean> {
  const subject = 'Confirmation de votre réservation'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Confirmation de réservation</h1>
        </div>
        <div class="content">
          <p>Bonjour ${firstName} ${lastName},</p>
          <p>Nous avons le plaisir de confirmer votre réservation.</p>
          <h2>Détails de la réservation</h2>
          <ul>
            <li><strong>Chambre:</strong> ${roomNumber} (${roomType})</li>
            <li><strong>Date d&apos;arrivée:</strong> ${new Date(checkIn).toLocaleDateString('fr-FR')}</li>
            <li><strong>Date de départ:</strong> ${new Date(checkOut).toLocaleDateString('fr-FR')}</li>
            <li><strong>Prix total:</strong> ${totalPrice.toLocaleString()} Ar</li>
          </ul>
          <p>Votre réservation est en attente de confirmation par notre équipe.</p>
          <p>Vous recevrez un email supplémentaire une fois votre réservation confirmée.</p>
          <p>Merci de votre confiance !</p>
        </div>
        <div class="footer">
          <p>Gestion Hôtelière</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({ to: email, subject, html })
}

/**
 * Email de confirmation de réservation par l'admin
 */
export async function sendBookingAcceptedEmail(
  email: string,
  firstName: string,
  lastName: string,
  roomNumber: string,
  roomType: string,
  checkIn: string,
  checkOut: string,
  totalPrice: number
): Promise<boolean> {
  const subject = 'Votre réservation a été confirmée'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10B981; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Réservation confirmée</h1>
        </div>
        <div class="content">
          <p>Bonjour ${firstName} ${lastName},</p>
          <p>Nous avons le plaisir de vous informer que votre réservation a été confirmée.</p>
          <h2>Détails de la réservation</h2>
          <ul>
            <li><strong>Chambre:</strong> ${roomNumber} (${roomType})</li>
            <li><strong>Date d&apos;arrivée:</strong> ${new Date(checkIn).toLocaleDateString('fr-FR')}</li>
            <li><strong>Date de départ:</strong> ${new Date(checkOut).toLocaleDateString('fr-FR')}</li>
            <li><strong>Prix total:</strong> ${totalPrice.toLocaleString()} Ar</li>
          </ul>
          <p>Nous vous attendons avec impatience !</p>
          <p>À votre arrivée, veuillez présenter une pièce d&apos;identité.</p>
          <p>Merci de votre confiance !</p>
        </div>
        <div class="footer">
          <p>Gestion Hôtelière</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({ to: email, subject, html })
}

/**
 * Email d'annulation de réservation
 */
export async function sendBookingCancelledEmail(
  email: string,
  firstName: string,
  lastName: string,
  roomNumber: string,
  roomType: string,
  checkIn: string,
  checkOut: string,
  penaltyAmount?: number
): Promise<boolean> {
  const subject = 'Annulation de votre réservation'

  const penaltyText = penaltyAmount && penaltyAmount > 0 
    ? `<p><strong>Pénalité d'annulation: ${penaltyAmount}€</strong></p>`
    : ''

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #EF4444; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Réservation annulée</h1>
        </div>
        <div class="content">
          <p>Bonjour ${firstName} ${lastName},</p>
          <p>Nous vous informons que votre réservation a été annulée.</p>
          ${penaltyText}
          <h2>Détails de la réservation annulée</h2>
          <ul>
            <li><strong>Chambre:</strong> ${roomNumber} (${roomType})</li>
            <li><strong>Date d&apos;arrivée:</strong> ${new Date(checkIn).toLocaleDateString('fr-FR')}</li>
            <li><strong>Date de départ:</strong> ${new Date(checkOut).toLocaleDateString('fr-FR')}</li>
          </ul>
          <p>Si vous avez des questions, n&apos;hésitez pas à nous contacter.</p>
          <p>Merci de votre compréhension.</p>
        </div>
        <div class="footer">
          <p>Gestion Hôtelière</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({ to: email, subject, html })
}

/**
 * Email de rappel avant l'arrivée
 */
export async function sendBookingReminderEmail(
  email: string,
  firstName: string,
  lastName: string,
  roomNumber: string,
  roomType: string,
  checkIn: string,
  checkOut: string,
  totalPrice: number
): Promise<boolean> {
  const subject = 'Rappel de votre réservation'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #F59E0B; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Rappel de réservation</h1>
        </div>
        <div class="content">
          <p>Bonjour ${firstName} ${lastName},</p>
          <p>Nous vous rappelons que votre arrivée est prévue demain.</p>
          <h2>Détails de votre réservation</h2>
          <ul>
            <li><strong>Chambre:</strong> ${roomNumber} (${roomType})</li>
            <li><strong>Date d&apos;arrivée:</strong> ${new Date(checkIn).toLocaleDateString('fr-FR')}</li>
            <li><strong>Date de départ:</strong> ${new Date(checkOut).toLocaleDateString('fr-FR')}</li>
            <li><strong>Prix total:</strong> ${totalPrice.toLocaleString()} Ar</li>
          </ul>
          <p>Nous vous attendons avec plaisir !</p>
          <p>À votre arrivée, veuillez présenter une pièce d&apos;identité.</p>
          <p>Merci de votre confiance !</p>
        </div>
        <div class="footer">
          <p>Gestion Hôtelière</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({ to: email, subject, html })
}
