import nodemailer from "nodemailer";

// Configuración de transporte
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "edificio.oasisdelvalle@gmail.com", 
        pass: "rteq pxfv lyld gqoh",
    },
});

interface OpceesEmail {
    to: string;
    subject: string;
    html: string;
}

export const enviarCorreo = async ({ to, subject, html }: OpceesEmail) => {
    try {
        const info = await transporter.sendMail({
            from: '"Portal de Reservas Edificio" <edificio.oasisdelvalle@gmail.com>',
            to,
            subject,
            html,
        });
        console.log(`✉️ Correo enviado con éxito. URL de prueba: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
        console.error("🚨 Error crítico al despachar la notificación por email:", error);
    }
};