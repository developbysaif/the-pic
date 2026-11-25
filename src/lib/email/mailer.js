import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || '"SAGE & BOTANICA" <concierge@sageandbotanica.com>';

function getTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/**
 * Sends order confirmation email to customer upon successful checkout.
 */
export async function sendOrderConfirmationEmail(order) {
  const transporter = getTransporter();

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #E5E8CE;">
        <td style="padding: 12px 8px; font-family: sans-serif; font-size: 13px; color: #263323;">
          <strong>${item.title}</strong><br/>
          <span style="font-size: 11px; color: #789575;">${item.variantName || 'Standard'}</span>
        </td>
        <td style="padding: 12px 8px; text-align: center; font-family: sans-serif; font-size: 13px; color: #263323;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 8px; text-align: right; font-family: sans-serif; font-size: 13px; color: #263323;">
          Rs. ${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join('');

  const html = `
    <div style="background-color: #FEFEF8; padding: 30px; font-family: 'Playfair Display', Georgia, serif; max-width: 600px; margin: auto; border: 1px solid #D4DBC0; border-radius: 16px;">
      <div style="text-align: center; border-bottom: 1px solid #D4DBC0; padding-bottom: 20px;">
        <h1 style="color: #263323; margin: 0; font-size: 26px; letter-spacing: 2px;">SAGE &amp; BOTANICA</h1>
        <p style="color: #789575; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 5px 0 0;">Pure Botanical Luxury</p>
      </div>

      <div style="padding: 24px 0; font-family: sans-serif;">
        <h2 style="color: #263323; font-size: 18px; margin-top: 0;">Order Confirmation #${order.orderNumber}</h2>
        <p style="color: #263323; font-size: 13px; line-height: 1.6;">
          Dear <strong>${order.customerDetails.name}</strong>,<br/>
          Thank you for embracing our botanical rituals. Your order has been registered and is being prepared with alpine care.
        </p>

        <div style="background-color: #E5E8CE; padding: 14px 18px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 0; font-size: 12px; font-weight: bold; color: #263323;">
            🌿 Payment Method: Cash on Delivery (COD)
          </p>
          <p style="margin: 4px 0 0; font-size: 11px; color: #263323;">
            Please keep Rs. ${order.total.toLocaleString()} ready at delivery. Our courier partner will contact you prior to arrival.
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #789575;">
              <th style="text-align: left; padding: 8px; font-size: 11px; text-transform: uppercase; color: #789575;">Formulation</th>
              <th style="text-align: center; padding: 8px; font-size: 11px; text-transform: uppercase; color: #789575;">Qty</th>
              <th style="text-align: right; padding: 8px; font-size: 11px; text-transform: uppercase; color: #789575;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 8px; text-align: right; font-size: 12px; color: #789575;">Subtotal:</td>
              <td style="padding: 8px; text-align: right; font-size: 12px; color: #263323;">Rs. ${order.subtotal.toLocaleString()}</td>
            </tr>
            ${
              order.discount > 0
                ? `<tr>
              <td colspan="2" style="padding: 8px; text-align: right; font-size: 12px; color: #789575;">Discount:</td>
              <td style="padding: 8px; text-align: right; font-size: 12px; color: #166534;">-Rs. ${order.discount.toLocaleString()}</td>
            </tr>`
                : ''
            }
            <tr>
              <td colspan="2" style="padding: 8px; text-align: right; font-size: 12px; color: #789575;">Delivery Fee:</td>
              <td style="padding: 8px; text-align: right; font-size: 12px; color: #263323;">${
                order.shippingFee === 0 ? 'Complimentary' : `Rs. ${order.shippingFee}`
              }</td>
            </tr>
            <tr style="border-top: 2px solid #789575;">
              <td colspan="2" style="padding: 10px 8px; text-align: right; font-size: 14px; font-weight: bold; color: #263323;">Payable at Delivery:</td>
              <td style="padding: 10px 8px; text-align: right; font-size: 14px; font-weight: bold; color: #263323;">Rs. ${order.total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 24px; font-size: 12px; color: #263323; background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #D4DBC0;">
          <strong>Shipping Address:</strong><br/>
          ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}, Pakistan<br/>
          Phone: ${order.customerDetails.phone}
        </div>
      </div>

      <div style="text-align: center; border-top: 1px solid #D4DBC0; padding-top: 16px; font-family: sans-serif; font-size: 11px; color: #789575;">
        <p>SAGE &amp; BOTANICA Concierge • Lahore, Pakistan • 100% Cash on Delivery</p>
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: EMAIL_FROM,
        to: order.customerDetails.email,
        subject: `Your SAGE & BOTANICA Order Confirmation #${order.orderNumber}`,
        html,
      });
      console.log(`[EMAIL SERVICE] Order confirmation email dispatched to ${order.customerDetails.email}`);
      return { sent: true };
    } catch (err) {
      console.error('[EMAIL SERVICE] Failed to send email via SMTP:', err.message);
      return { sent: false, error: err.message };
    }
  } else {
    console.log(
      `[EMAIL SERVICE] SMTP credentials not configured in environment. Simulated order confirmation for #${order.orderNumber} to ${order.customerDetails.email}.`
    );
    return { sent: false, simulated: true };
  }
}

/**
 * Sends password recovery link to user's email.
 */
export async function sendPasswordResetEmail(email, resetUrl) {
  const transporter = getTransporter();

  const html = `
    <div style="background-color: #FEFEF8; padding: 30px; font-family: 'Playfair Display', Georgia, serif; max-width: 500px; margin: auto; border: 1px solid #D4DBC0; border-radius: 16px;">
      <div style="text-align: center; border-bottom: 1px solid #D4DBC0; padding-bottom: 20px;">
        <h1 style="color: #263323; margin: 0; font-size: 24px; letter-spacing: 2px;">SAGE &amp; BOTANICA</h1>
        <p style="color: #789575; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 5px 0 0;">Password Recovery</p>
      </div>

      <div style="padding: 24px 0; font-family: sans-serif; text-align: center;">
        <h2 style="color: #263323; font-size: 18px; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #263323; font-size: 13px; line-height: 1.6;">
          We received a request to reset the password for your SAGE &amp; BOTANICA apothecary account. Click the button below to establish a new password.
        </p>

        <div style="margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #789575; color: #ffffff; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-size: 13px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>

        <p style="font-size: 11px; color: #789575; line-height: 1.5;">
          This recovery link is valid for 1 hour. If you did not initiate this request, your account remains secure and no action is required.
        </p>
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: EMAIL_FROM,
        to: email,
        subject: 'Reset Your SAGE & BOTANICA Password',
        html,
      });
      console.log(`[EMAIL SERVICE] Password reset email dispatched to ${email}`);
      return { sent: true };
    } catch (err) {
      console.error('[EMAIL SERVICE] Failed to send password reset email:', err.message);
      return { sent: false, error: err.message };
    }
  } else {
    console.log(
      `[EMAIL SERVICE] SMTP not configured. Simulated recovery link for ${email}: ${resetUrl}`
    );
    return { sent: false, simulated: true, resetUrl };
  }
}
