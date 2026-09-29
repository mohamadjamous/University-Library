import { Client as WorkflowClient } from "@upstash/workflow";
import emailjs from "@emailjs/nodejs";
import config from "@/lib/config";

export const workflowClient = new WorkflowClient({
  baseUrl: config.env.upstash.qstashUrl,
  token: config.env.upstash.qstashToken,
});

export const sendEmail = async ({
  email,
  subject,
  message,
}: {
  email: string;
  subject: string;
  message: string;
}) => {
  await emailjs.send(
    config.env.emailjs.serviceId,
    config.env.emailjs.templateId,
    {
      to_email: email,
      subject,
      message, // HTML string
    },
    {
      publicKey: config.env.emailjs.publicKey,
      privateKey: config.env.emailjs.privateKey,
    },
  );
};