import { Resend } from "resend";

if (!process.env.RESEND_EMAIL_API_KEY) {
  throw new Error('RESEND_EMAIL_API_KEY environment variable is not defined');
}

const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);

export default resend;