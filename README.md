# Fullstack Next.js App with Clerk and Convex

This is a production-ready fullstack web application built with Next.js 14, React 18, Tailwind CSS 3.4, Clerk for authentication, and Convex for the backend.

## Setup Instructions

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Copy the `.env.example` file to `.env.local` and fill in your API keys.
    ```bash
    cp .env.example .env.local
    ```

3.  **Start the Development Server:**
    ```bash
    npm run dev
    ```

4.  **Start Convex Development Server:**
    In a separate terminal, run:
    ```bash
    npx convex dev
    ```

## How to get Clerk keys

1.  Go to the [Clerk Dashboard](https://dashboard.clerk.com/).
2.  Create a new application or select an existing one.
3.  In the sidebar, go to **API Keys**.
4.  Copy the **Publishable Key** and **Secret Key**.
5.  Paste them into your `.env.local` file as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
6.  To get the `CLERK_ISSUER_URL`, go to **JWT Templates** in the Clerk sidebar, create a new Convex template, and copy the Issuer URL.

## How to configure Convex auth

1.  Go to the [Convex Dashboard](https://dashboard.convex.dev/).
2.  Select your project.
3.  Go to **Settings** -> **Authentication**.
4.  You don't need to manually configure anything here if you are using the JWT template from Clerk. The `convex/auth.config.ts` file handles the configuration using the `CLERK_ISSUER_URL`.

## Dev vs Prod explanation

*   **Development:** In development, you run `npm run dev` for the Next.js frontend and `npx convex dev` for the Convex backend. The Convex dev server automatically syncs your schema and functions to the Convex cloud.
*   **Production:** In production, you build the Next.js app using `npm run build` and start it with `npm run start`. For Convex, you deploy your functions using `npx convex deploy`.

## Deployment instructions for Vercel

1.  Push your code to a GitHub repository.
2.  Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** -> **Project**.
3.  Import your GitHub repository.
4.  In the **Environment Variables** section, add all the variables from your `.env.local` file.
5.  Click **Deploy**.
6.  Once deployed, make sure to update your Clerk application settings with your new Vercel domain (e.g., add it to the allowed origins).
7.  Deploy your Convex backend to production by running `npx convex deploy` in your terminal.
