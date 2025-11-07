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
} from "../config/env.js";
import { sendEmail } from "./send-mail.js";
import { twoFactor } from "better-auth/plugins";
import { prisma } from "../config/database.js";
import {
  getTwoFactorOTPTemplate,
  getEmailVerificationTemplate,
  getPasswordResetTemplate,
} from "./email-templates.js";

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
              html: getTwoFactorOTPTemplate({
                userName: user.name,
                otp: otp,
              }),
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
        html: getEmailVerificationTemplate({
          userName: user.name,
          url: verificationUrl.toString(),
        }),
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
        html: getPasswordResetTemplate({
          userName: user.name,
          url: resetUrl.toString(),
        }),
      });

    },
  },
});

export default auth;
