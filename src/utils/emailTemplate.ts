// email template
export const generatePasswordResetEmail = (otp: string) => {
  return `
    <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #1D3F75; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://i.imgur.com/h4SQEqJ.png" alt="I Know Tennis" style="width: 120px; margin-bottom: 20px;" />
      </div>
      <div style="background-color: #009F80; padding: 40px; border-radius: 8px; color: white; text-align: center;">
        <h2 style="font-size: 24px; font-weight: bold; margin: 0;">Reset Your Password</h2>
        <p style="font-size: 16px; margin-top: 8px;">You requested to reset your password. Please use the OTP below to proceed.</p>
        <h1 style="font-size: 40px; font-weight: bold; margin: 30px 0; letter-spacing: 5px; color: #FFDC5C;">${otp}</h1>
        <p style="font-size: 16px;">This OTP will expire in 10 minutes.</p>
      </div>
      <div style="margin-top: 20px; text-align: center;">
        <p style="font-size: 14px; color: #fff;">If you did not request this, please ignore this email.</p>
      </div>
      <div style="margin-top: 40px; text-align: center;">
        <p style="font-size: 12px; color: #bbb;">i Know Tennis | All rights reserved</p>
      </div>
    </div>
  `;
};
