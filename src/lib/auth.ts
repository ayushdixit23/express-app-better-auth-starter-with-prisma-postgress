import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  FRONTEND_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  NODE_ENV
} from "../utils/envConfig.js";
import { sendEmail } from "./send-mail.js";
import { twoFactor } from "better-auth/plugins";
import { prisma } from "../helpers/connectDb.js";

const auth = betterAuth({
  appName: "Express App",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,

  // Session & Cookie Configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache for 5 minutes (in seconds)
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days (in seconds)
    updateAge: 60 * 60 * 24, // Update session every 24 hours (in seconds)
  },

  // Advanced Cookie Settings
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  // Social Providers (OAuth)
  socialProviders: {
    github: {
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    },
  },

  plugins: [
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          try {
            await sendEmail({
              sendTo: user.email,
              subject: "Your Two-Factor Authentication Code",
              text: `Your verification code is: ${otp}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; text-align: center;">
                    <h2 style="color: #333; margin-bottom: 20px;">Two-Factor Authentication</h2>
                    <p style="color: #666; margin-bottom: 20px;">Hello ${user.name || 'User'},</p>
                    <p style="color: #666; margin-bottom: 30px;">Use the following code to complete your two-factor authentication:</p>
                    <div style="background-color: #0f766e; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 4px; margin: 20px 0;">
                      ${otp}
                    </div>
                    <p style="color: #666; font-size: 14px; margin-top: 20px;">
                      This code will expire in 10 minutes for security reasons.
                    </p>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                      <p style="color: #999; font-size: 12px;">
                        If you didn't request this code, please ignore this email or contact support.
                      </p>
                    </div>
                  </div>
                </div>
              `,
            });

          } catch (error) {
            console.error("❌ Failed to send OTP email:", error);
            throw error;
          }
        },
      },
    }),
  ],

  // Trusted origins for CORS
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8080",
    FRONTEND_URL,
  ],

  // Rate limiting for auth endpoints
  rateLimit: {
    window: 10, // 10 seconds
    max: 100,   // 100 requests
  },

  // Email verification configuration
  emailVerification: {
    autoSignInAfterVerification: true,
    enabled: true,
    sendVerificationEmail: async ({ user, url }) => {
      const verificationUrl = new URL(url);
      verificationUrl.searchParams.set("callbackURL", `${FRONTEND_URL}/email-verification`);

      await sendEmail({
        sendTo: user.email,
        subject: "Verify your email address",
        text: `Click here to verify your email: ${verificationUrl.toString()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px;">
              <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email</h2>
              <p style="color: #666; margin-bottom: 20px;">Hello ${user.name || "User"},</p>
              <p style="color: #666; margin-bottom: 30px;">
                Thank you for signing up! Please click the button below to verify your email address:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl.toString()}" 
                   style="background-color: #0f766e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Verify Email
                </a>
              </div>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="word-break: break-all; color: #0f766e; font-size: 12px; background-color: #f0fdf4; padding: 10px; border-radius: 4px;">
                ${verificationUrl.toString()}
              </p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #999; font-size: 12px;">
                  If you didn't create this account, please ignore this email.
                </p>
              </div>
            </div>
          </div>
        `,
      });

    },
    sendOnSignUp: true,
  },

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      const resetUrl = new URL(url);
      resetUrl.searchParams.set("callbackURL", `${FRONTEND_URL}/reset-password`);

      await sendEmail({
        sendTo: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${resetUrl.toString()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px;">
              <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
              <p style="color: #666; margin-bottom: 20px;">Hello ${user.name || "User"},</p>
              <p style="color: #666; margin-bottom: 30px;">
                You requested to reset your password. Click the button below to create a new password:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl.toString()}" 
                   style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Reset Password
                </a>
              </div>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="word-break: break-all; color: #dc3545; font-size: 12px; background-color: #fff5f5; padding: 10px; border-radius: 4px;">
                ${resetUrl.toString()}
              </p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #999; font-size: 12px;">
                  If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                </p>
              </div>
            </div>
          </div>
        `,
      });

    },
  },
});

export default auth;
