import sgMail from "@sendgrid/mail";
import Logger from "./logger.ts";

export const sendEmail = async (
  toEmail: string[],
  template: string,
  data?: Record<string, any>
) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  const msg = {
    to: toEmail.join(","),
    from: {
      email: "operations@feyncode.com",
      name: "FeynCode",
    },
    templateId: template,
    dynamic_template_data: data,
  };
  try {
    await sgMail.send(msg);
    Logger.info(
      "Email sent to ---- " + toEmail.join(",") + " ---- " + template
    );
    return;
  } catch (error) {
    Logger.error(error);
  }
};
