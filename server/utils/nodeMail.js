import nodemailer from 'nodemailer';

/**
 * Utility function to send emails securely using Nodemailer.
 * * @param {string} email - The recipient's email address.
 * @param {string} subject - The subject line of the email.
 * @param {string} text - The plain text body of the email.
 */
const sendMail = async (email, subject, text) => {
    try {
        // 1. Create the Transporter (The "Mail Carrier")
        // This configuration is specifically optimized for Gmail.
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL, // Your Gmail address from .env
                pass: process.env.EMAIL_PASS // Your Gmail App Password from .env
            }
        });

        // 2. Define the Email Options
        const mailOptions = {
            from: `"Student Portal Security" <${process.env.EMAIL}>`, // Sender display name and address
            to: email,
            subject: subject,
            text: text,
            // html: `<b>${text}</b>` // Optional: You can pass HTML here if you want prettier emails!
        };

        // 3. Send the Email
        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Email sent successfully to ${email} (Message ID: ${info.messageId})`);

    } catch (error) {
        console.error("❌ Error sending email: ", error.message);
        // We throw the error so the controller that called sendEmail knows it failed
        throw new Error("Email could not be sent. Please try again later.");
    }
};

export default sendMail; 