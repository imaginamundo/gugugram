import nodemailer from "nodemailer";
import { MAILER_SERVICE, MAILER_HOST, MAILER_USER, MAILER_PASSWORD } from "astro:env/server";

const transporter = nodemailer.createTransport({
	service: MAILER_SERVICE,
	host: MAILER_HOST,
	port: 587,
	secure: false,
	auth: {
		user: MAILER_USER,
		pass: MAILER_PASSWORD,
	},
});

export async function sendEmail({
	to,
	subject,
	text,
	html,
}: {
	to: string;
	subject: string;
	text: string;
	html: string;
}) {
	const options = {
		from: `Diogo do Gugugram <${MAILER_USER}>`,
		to,
		subject,
		text,
		html,
	};

	try {
		return await transporter.sendMail(options);
	} catch (error) {
		console.error("Mailer Error:", error);
		throw new Error("FAILED_TO_SEND_EMAIL");
	}
}
