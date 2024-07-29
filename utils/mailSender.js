const SibApiV3Sdk = require("sib-api-v3-sdk");

const mailSender = async (email, subject, htmlBody, textBody = "") => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error(
      "BREVO_API_KEY is not defined in the environment variables"
    );
  }

  // Configure API key authorization
  SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey = apiKey;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  // Define the email parameters
  const sendSmtpEmail = {
    to: [{ email: email }], // Recipient email
    sender: { email: "ujjwalphy9@gmail.com", name: "SkillsSprout" }, // Sender email
    subject: subject,
    htmlContent: htmlBody,
    textContent: textBody || "ScillsSprout", // Ensure textContent is included
    headers: {
      "X-Mailin-custom":
        "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
    },
  };

  try {
    // Send the email
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error occurred while sending email:", error.message);
    throw error;
  }
};

module.exports = mailSender;
