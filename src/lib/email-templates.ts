interface EmailTemplateParams {
    userName?: string | null;
    url?: string;
    otp?: string;
  }
  
  /**
   * Shared wrapper for consistent layout, spacing, and design
   */
  const baseWrapper = (content: string) => `
    <div style="
      background-color: #f5f7fa;
      padding: 40px 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      line-height: 1.5;
    ">
      <div style="
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        overflow: hidden;
      ">
        <div style="padding: 40px 32px;">
          ${content}
        </div>
        <div style="
          background-color: #fafafa;
          padding: 16px 32px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        ">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            This is an automated message. Please do not reply.
          </p>
        </div>
      </div>
    </div>
  `;
  
  /**
   * 🔐 Two-Factor Authentication (OTP) Template
   */
  export const getTwoFactorOTPTemplate = ({ userName, otp }: EmailTemplateParams): string => {
    const content = `
      <h2 style="margin: 0 0 20px; font-size: 22px; color: #0f172a;">Two-Factor Authentication</h2>
      <p style="margin: 0 0 12px;">Hi ${userName || 'there'},</p>
      <p style="margin: 0 0 28px; color: #374151;">
        Use the following one-time code to complete your login:
      </p>
  
      <div style="
        background-color: #111827;
        color: #ffffff;
        font-size: 36px;
        font-weight: bold;
        padding: 18px 0;
        border-radius: 10px;
        letter-spacing: 6px;
        text-align: center;
      ">
        ${otp}
      </div>
  
      <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">
        This code expires in 10 minutes. If you didn’t request this, you can safely ignore this email.
      </p>
    `;
  
    return baseWrapper(content);
  };
  
  /**
   * 📧 Email Verification Template
   */
  export const getEmailVerificationTemplate = ({ userName, url }: EmailTemplateParams): string => {
    const content = `
      <h2 style="margin: 0 0 20px; font-size: 22px; color: #0f172a;">Verify Your Email</h2>
      <p style="margin: 0 0 12px;">Hi ${userName || 'there'},</p>
      <p style="margin: 0 0 28px; color: #374151;">
        Please confirm your email address by clicking the button below:
      </p>
  
      <div style="text-align: center; margin: 32px 0;">
        <a href="${url}" style="
          background-color: #2563eb;
          color: #ffffff;
          padding: 12px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          display: inline-block;
        ">
          Verify Email
        </a>
      </div>
  
      <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
        Or copy this link into your browser:
      </p>
      <p style="
        background-color: #f3f4f6;
        padding: 10px;
        border-radius: 6px;
        font-size: 12px;
        color: #1e3a8a;
        word-break: break-all;
      ">
        ${url}
      </p>
    `;
  
    return baseWrapper(content);
  };
  
  /**
   * 🔄 Password Reset Template
   */
  export const getPasswordResetTemplate = ({ userName, url }: EmailTemplateParams): string => {
    const content = `
      <h2 style="margin: 0 0 20px; font-size: 22px; color: #0f172a;">Reset Your Password</h2>
      <p style="margin: 0 0 12px;">Hi ${userName || 'there'},</p>
      <p style="margin: 0 0 28px; color: #374151;">
        You requested a password reset. Click the button below to set a new password:
      </p>
  
      <div style="text-align: center; margin: 32px 0;">
        <a href="${url}" style="
          background-color: #dc2626;
          color: #ffffff;
          padding: 12px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          display: inline-block;
        ">
          Reset Password
        </a>
      </div>
  
      <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
        Or copy this link into your browser:
      </p>
      <p style="
        background-color: #fef2f2;
        padding: 10px;
        border-radius: 6px;
        font-size: 12px;
        color: #b91c1c;
        word-break: break-all;
      ">
        ${url}
      </p>
  
      <p style="margin-top: 28px; font-size: 13px; color: #6b7280;">
        If you didn’t request this, please ignore this email.
      </p>
    `;
  
    return baseWrapper(content);
  };
  