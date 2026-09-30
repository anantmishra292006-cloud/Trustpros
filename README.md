# LocalVerity - White-Label Local Services Directory Kit

Welcome to **LocalVerity**! This documentation guide will help you install, configure, customize, and deploy your new white-label local services directory.

---

## 1. Product Overview

**LocalVerity** is a complete, production-ready, white-label web application designed for community operators, solo founders, and local publishers who want to launch and run a curated directory of verified trade professionals (such as plumbers, electricians, HVAC technicians, roofers, and home specialists) for a specific city or metropolitan area.

### What is Included in This Package:
- **Full Source Code**: Complete frontend and full-stack codebase built with React 19, TypeScript, Tailwind CSS, and Vite.
- **Public Directory & Search**: Dynamic keyword search, category filtering, service area filtering, minimum rating filter, verified credentials filter, and sorting options (recommended, highest rated, most reviewed, newest).
- **Provider Profiles**: Professional profile pages displaying business credentials, verified badges (Government ID, Trade License, Liability Insurance), offered services, response times, pricing, verified customer reviews, and appointment request forms.
- **Direct Deposit Booking System**: Customers can submit date/time appointment requests and receive the specialist's direct payment link (e.g. Stripe Payment Link). No middleman commissions or escrow liability for the operator.
- **Booking Lifecycle Management**: Real-time status tracking (`requested`, `confirmed`, `completed`, `no_show`, `cancelled`) with full activity timestamps.
- **Verified Customer Review Engine**: Only customers with confirmed, completed bookings can submit 1 to 5-star ratings and written reviews.
- **Automated Reliability Scoring & Strike System**: Automatic calculation of provider reliability based on completed vs. cancelled/no-show jobs. Includes a 3-strike rule that automatically suspends delinquent providers.
- **Dispute Resolution Center**: Customers and providers can open mediation tickets for problematic appointments; directory administrators can review evidence, record resolution notes, and issue administrative strikes.
- **Operator Admin Dashboard**: Comprehensive management console with KPI analytics, provider approval queue with private document inspection, user and provider directories, booking logs, dispute management, CSV data export, white-label branding customizer, and a 1-click sample demo data manager.
- **Role-Based Portals**: Tailored dashboards for Customers (track bookings & reviews) and Providers (manage listings, availability, rates, deposit links, and incoming requests).
- **Security & Storage Rules**: Production-hardened Firestore and Firebase Storage security rules protecting private identification documents and preventing unauthorized privilege escalation.
- **Built-in Legal Templates**: Pre-configured, editable Terms of Service, Privacy Policy, and Escrow & Direct Payment Disclaimers.

---

## 2. Important Notice

Please read this notice before getting started:

This purchase is for the **source code only**. 

As the purchaser and operator of this software, you are solely responsible for:
- Creating, configuring, and paying for your own Google Firebase project and usage.
- Purchasing and connecting your own custom domain name and SSL certificates.
- Setting up and paying for your own web hosting platform (e.g. Firebase Hosting, Vercel, Netlify).
- Building, testing, and deploying the software.
- Setting up any third-party accounts (such as Stripe or other payment processors for provider deposit links).
- Ongoing server maintenance, database backups, bug fixes, and security patches.
- Any future custom modifications, designs, or new features you wish to add.

> **Note**: This digital product is a one-time source code purchase. It does **not** include ongoing technical support, consulting, custom programming, or automatic future updates.

---

## 3. Requirements

To run, customize, and deploy this project, you will need the following tools installed on your computer:

1. **Node.js**: Version `18.x` or `20.x` LTS. You can download and install Node.js from [nodejs.org](https://nodejs.org/).
2. **npm**: Version `9.x` or higher (npm is automatically included when you install Node.js).
3. **Google Account / Firebase Account**: A free Google account to access the [Firebase Console](https://console.firebase.google.com).
4. **Git** *(Optional)*: Recommended for version control and deploying to platforms like Vercel or Netlify. Download from [git-scm.com](https://git-scm.com/).
5. **Code Editor**: A code editor such as [Visual Studio Code](https://code.visualstudio.com/) for opening and editing files.
6. **Modern Web Browser**: Google Chrome, Mozilla Firefox, Apple Safari, or Microsoft Edge.

---

## 4. Installation

Follow these exact steps to set up the project on your local computer:

### Step 1: Open the Project Folder
Unzip the downloaded code files and open your terminal (macOS/Linux) or Command Prompt / PowerShell (Windows). Navigate to the project root directory:

```bash
cd path/to/localverity
```

### Step 2: Install Project Dependencies
Run the standard npm installation command:

```bash
npm install
```

This will download and install all required libraries (React, Vite, Firebase SDK, Tailwind CSS, Lucide icons) into a `node_modules` folder.

### Step 3: Set Up Your Environment File
Create a new file named `.env` in the root directory by copying the provided example file:

On macOS / Linux:
```bash
cp .env.example .env
```

On Windows (Command Prompt):
```cmd
copy .env.example .env
```

On Windows (PowerShell):
```powershell
Copy-Item .env.example .env
```

*(See Section 5 and Section 6 below for how to fill in this file with your own Firebase keys).*

### Step 4: Start the Local Development Server
Once dependencies are installed and `.env` is created, run:

```bash
npm run dev
```

You should see terminal output confirming that the local server is running:
```
  VITE v8.x.x  ready in 250 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://0.0.0.0:3000/
```

Open `http://localhost:3000` in your web browser to view your directory.

---

## 5. Environment Variables

All sensitive and environment-specific settings are loaded from the `.env` file located in the project root directory.

Open the `.env` file in your code editor. It contains the following variables:

```env
# ==============================================================================
# LocalVerity - Environment Configuration
# ==============================================================================

# Firebase Project Credentials
# Obtain these values from your Firebase Project Console -> Project Settings -> General -> Your Apps -> Web App
VITE_FIREBASE_API_KEY="AIzaSyYourApiKeyHere"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"
VITE_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"

# Designated Platform Administrator Email
# When a user registers with this exact email, they are automatically granted the 'admin' role
VITE_ADMIN_EMAIL="admin@yourdomain.com"

# Host Application URL
APP_URL="http://localhost:3000"
```

### Explanation of Each Variable:

| Variable Name | Description | Where to Get It |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Public Firebase Web API Key | Firebase Console -> Project Settings -> General -> Web App configuration |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Authentication domain | Firebase Console -> Project Settings -> General -> Web App configuration |
| `VITE_FIREBASE_PROJECT_ID` | Your unique Firebase Project ID | Firebase Console -> Project Settings -> General -> Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket address for file uploads | Firebase Console -> Storage -> Bucket URL (or Web App configuration) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging Sender ID number | Firebase Console -> Project Settings -> General -> Web App configuration |
| `VITE_FIREBASE_APP_ID` | Firebase Web App Identifier | Firebase Console -> Project Settings -> General -> Web App configuration |
| `VITE_FIREBASE_MEASUREMENT_ID` | Google Analytics Measurement ID (optional) | Firebase Console -> Project Settings -> General -> Web App configuration |
| `VITE_ADMIN_EMAIL` | The email address of the directory operator | Choose your own email (e.g. `you@yourdomain.com`). Registration with this email will grant full Administrator access. |
| `APP_URL` | The public base URL of the website | Use `http://localhost:3000` for local testing, or `https://yourdomain.com` for production. |

> **Important Security Rule**: Never share your private Firebase credentials publicly, and never commit your `.env` file to a public GitHub repository. The `.gitignore` file is already pre-configured to ignore `.env`.

---

## 6. Firebase Setup

Follow this step-by-step guide to set up your free Google Firebase backend:

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and sign in with your Google account.
2. Click **Add project** (or **Create a project**).
3. Enter a project name (for example, `my-city-local-pros`).
4. You can enable or disable Google Analytics depending on your preference.
5. Click **Create project** and wait a few seconds for Firebase to prepare your resources.

### Step 2: Register the Web Application
1. In your new Firebase Project dashboard, click the **Web icon** (`</>`) located under *"Get started by adding Firebase to your app"*.
2. Enter an App nickname (for example, `LocalVerity Web`).
3. You can leave *"Also set up Firebase Hosting"* unchecked for now.
4. Click **Register app**.
5. Firebase will display your `firebaseConfig` credentials object. Keep this page open or copy the values directly into your `.env` file (see Section 5).

### Step 3: Enable Firebase Authentication
1. In the left sidebar of the Firebase Console, go to **Build** → **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, click **Email/Password**.
4. Turn on the first toggle: **Enable** (Email/Password).
5. Leave "Email link (passwordless sign-in)" disabled.
6. Click **Save**.

### Step 4: Create Cloud Firestore Database
1. In the left sidebar, go to **Build** → **Firestore Database**.
2. Click **Create database**.
3. Choose a database location geographically close to your target audience (for example, `us-central` or `us-east`).
4. For security rules, select **Start in production mode** (we will deploy strict rules in Step 6).
5. Click **Create**.

### Step 5: Enable Firebase Storage (for Documents & Photos)
1. In the left sidebar, go to **Build** → **Storage**.
2. Click **Get Started**.
3. Accept the default security rules prompt and click **Next**.
4. Select your preferred Cloud Storage location (ideally the same region as your Firestore database).
5. Click **Done**.

### Step 6: Configure Firestore Security Rules
To protect your database from unauthorized access while allowing public visitors to browse approved listings:
1. In the Firebase Console, go to **Firestore Database** → click the **Rules** tab at the top.
2. Open the file named `firestore.rules` included in this project folder with your text editor.
3. Select all the text in `firestore.rules`, copy it, and paste it into the Firebase Rules editor, replacing everything.
4. Click **Publish**.

*(Alternatively, if you use the Firebase CLI, you can run `firebase deploy --only firestore:rules`).*

### Step 7: Configure Storage Security Rules
To ensure contractor verification documents (government IDs, licenses, insurance policies) are private and readable only by the uploading contractor and directory administrators:
1. In the Firebase Console, go to **Storage** → click the **Rules** tab at the top.
2. Open the file named `storage.rules` included in this project folder.
3. Select all the text in `storage.rules`, copy it, and paste it into the Firebase Storage Rules editor, replacing everything.
4. Click **Publish**.

*(Alternatively, via Firebase CLI: `firebase deploy --only storage`).*

### Step 8: Update Your `.env` File
Ensure all the keys from Step 2 are pasted into your `.env` file, and save the file. Restart your development server (`npm run dev`) if it was already running.

---

## 7. Admin Setup

The application features three distinct user roles:
1. **Customer**: Can search the directory, submit appointment booking requests, mark deposits as sent, write reviews on completed jobs, and open dispute tickets.
2. **Provider**: Can apply as a contractor, upload private verification documents, set service areas and rates, paste direct deposit links, confirm/complete appointments, and track their reliability score.
3. **Admin**: Has complete control over directory branding, provider approvals/rejections, administrative strikes, dispute mediation, and CSV data exports.

### How to Create Your Administrator Account:
You can become the Administrator in either of two ways:

#### Method A: Designated Admin Email (Recommended)
1. Open your `.env` file.
2. Set `VITE_ADMIN_EMAIL` to your own email address:
   ```env
   VITE_ADMIN_EMAIL="yourname@yourdomain.com"
   ```
3. Start the application locally (`npm run dev`).
4. Click **Sign In** in the top navigation, then select **Create an account**.
5. Register using the exact same email address you entered in `VITE_ADMIN_EMAIL`.
6. The system automatically detects your email, assigns your account the `admin` role in Firestore, and records your UID in the protected `/admins` collection.
7. An **Operator Admin** button will immediately appear in the navigation bar.

#### Method B: First Registered User Bootstrap
If the database has zero registered users, the very first user who registers on the site is automatically elevated to `admin` status.

### Security Note on Admin Permissions:
Ordinary customers and providers **cannot** promote themselves to Admin. The Firestore Security Rules (`firestore.rules`) strictly enforce:
```javascript
incoming().role == existing().role
```
This guarantees that only existing administrators can modify user roles or approve directory listings.

---

## 8. Database Setup

### Are collections created automatically?
**Yes!** Cloud Firestore is a schema-less NoSQL database. You do **not** need to manually create any tables, columns, or collections in the Firebase Console.

The application automatically creates collections and documents on demand:
- `/users`: Created when users register.
- `/admins`: Created when an administrator is bootstrapped.
- `/providers`: Created when a provider submits their listing application.
- `/verification_documents`: Created when a provider uploads their licensing, ID, and insurance files.
- `/bookings`: Created when a customer requests an appointment.
- `/reviews`: Created when a customer reviews a completed booking.
- `/disputes`: Created when a dispute ticket is opened.
- `/branding/config`: Created when the administrator saves branding settings.

If the `/branding/config` document does not exist yet, the application gracefully loads the built-in default settings (see Section 11).

---

## 9. Running the Application

The available commands in `package.json` are:

### Run Development Mode (Local Testing)
```bash
npm run dev
```
Starts the Vite local development server at `http://localhost:3000`. Changes to source files reload instantly.

### Validate Types & Syntax
```bash
npm run lint
```
Runs the TypeScript compiler (`tsc --noEmit`) to verify that all code compiles without type errors.

### Build for Production
```bash
npm run build
```
Compiles and bundles the application into optimized, minified HTML, CSS, and JavaScript files in the `dist` folder.

### Preview the Production Build Locally
```bash
npm run preview
```
Serves the contents of the `dist` folder locally so you can test the production build before uploading it to your web host.

---

## 10. Deployment

Because LocalVerity is a modern Single Page Application (SPA), it can be deployed to any static web hosting provider. Below are the three most popular deployment methods:

### Option A: Firebase Hosting (Recommended)
Because you already have a Firebase project, Firebase Hosting is the simplest and fastest solution. A pre-configured `firebase.json` file is already included in this repository.

1. Install the Firebase Command Line Interface (CLI) globally on your computer:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in to your Firebase account:
   ```bash
   firebase login
   ```
3. Link your Firebase project:
   ```bash
   firebase use --add
   ```
   (Select your Firebase project from the list)
4. Build the production application bundle:
   ```bash
   npm run build
   ```
5. Deploy hosting and security rules:
   ```bash
   firebase deploy
   ```
Firebase will provide you with a live URL (e.g. `https://your-project-id.web.app`). You can connect a custom domain in the Firebase Console under **Hosting** → **Add custom domain**.

---

### Option B: Deploy to Vercel
A pre-configured `vercel.json` file is already included in the project root to handle SPA client routing automatically.

1. Push your project code to a private GitHub, GitLab, or Bitbucket repository.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New** → **Project**.
3. Import your repository.
4. In the Project Configuration screen:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Open the **Environment Variables** section and add every variable from your `.env` file (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_ADMIN_EMAIL`, etc.).
6. Click **Deploy**.

---

### Option C: Deploy to Netlify
A pre-configured `public/_redirects` file is already included in the project to automatically configure single-page application (SPA) rewrites.

1. Sign in to [Netlify](https://www.netlify.com/).
2. Click **Add new site** → **Import an existing project** from your Git provider.
3. Configure the build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Add your environment variables in Netlify under **Site settings** → **Environment variables**.
5. Click **Deploy site**.

---

## 11. Customization

LocalVerity is designed for complete white-labeling so you can adapt it to any city, trade niche, or brand identity.

### 1. In-App White-Label Settings (No Coding Required)
You can customize almost all branding settings directly from the web browser:
1. Log in with your Administrator account.
2. Click **Operator Admin** in the navigation bar.
3. Click the **Directory Branding & Configuration** tab.
4. From this visual screen, you can edit:
   - **Directory Name**: Changes the brand name across the entire app, navigation, header, and footer.
   - **Tagline**: Sets the subtitle displayed on the homepage hero.
   - **City / Metro Region**: Change target city (e.g., *"Denver, CO & Metro Area"*, *"Miami, FL & Dade County"*, or *"London, UK"*).
   - **Primary Brand Color**: Pick any hex color code (e.g., Royal Blue, Forest Green, Amber). The entire UI automatically adjusts its accent colors.
   - **Logo URL**: Enter a URL to your custom brand logo image.
   - **Service Categories**: Add, remove, or rename trade categories (e.g., Plumbing, Electrical, Landscaping, Roofing).
   - **Global Deposit Instructions**: Set the standard payment advisory shown to customers when reserving appointments.
   - **Terms of Service**: Edit your legal terms in the rich text box.
   - **Privacy Policy**: Edit your privacy policy.
   - **Escrow & Direct Payment Disclaimer**: Update the explicit legal disclaimer confirming the operator does not hold customer funds.
5. Click **Save Directory Branding**. All changes are saved to Firestore and take effect immediately.

### 2. Customizing HTML Title, Meta Tags & Favicon
To change the browser tab title, favicon, and SEO meta tags:
- Open `index.html`:
  - Edit line 6: `<title>Your Directory Name</title>`
  - Edit line 7: `<meta name="description" content="Your description" />`
  - Edit lines 8-9: OpenGraph social media sharing titles and descriptions.
- To change the favicon, replace the favicon link or add your icon to the `public/` directory.

### 3. Modifying Default Code Fallbacks
If you want to change the default branding values that load prior to database configuration, edit:
- `src/services/brandingService.ts` → `DEFAULT_BRANDING` object.

---

## 12. Demo Data

LocalVerity includes a built-in **1-Click Demo Data Management Tool** to help you test the platform immediately.

### How to Load Demo Providers:
1. Log in to the application with your Administrator account.
2. Go to **Operator Admin** → **Overview** tab.
3. Look for the blue **Demo Provider Management** card.
4. Click **Load Sample Data**.
5. The application will instantly inject 4 authentic, high-quality specialist profiles into your Firestore database:
   - `[DEMO] Apex Premier Plumbing & Drain`
   - `[DEMO] Lone Star Master Electric & Solar`
   - `[DEMO] Travis County Climate Systems`
   - `[DEMO] Capital City Craftsman & Repair`
6. Each demo profile includes verified credentials badges, sample reviews, ratings, services, and rates.

### How to Remove Demo Providers:
1. When you are ready to launch your real directory, return to **Operator Admin** → **Overview**.
2. Click the red button: **Remove Demo Data (1-Click)**.
3. All demo contractors, verification documents, and sample reviews are permanently erased from Firestore.

> **Important Warning**: All demo providers, reviews, and phone numbers are completely fictional. You must remove demo data before marketing or launching your directory to real customers.

---

## 13. Troubleshooting

Here are solutions for the most common setup and deployment issues:

### 1. "Firebase services are not initialized" or Blank Screen
- **Cause**: The `.env` file is missing or contains empty quotes for Firebase credentials.
- **Fix**: Check that your `.env` file exists in the root folder (not inside `src/`) and that every `VITE_FIREBASE_*` variable has a valid value copied from your Firebase Console. Remember to restart your terminal server (`npm run dev`) after creating or editing `.env`.

### 2. "auth/operation-not-allowed" or "auth/configuration-not-found"
- **Cause**: Email/Password authentication is not turned on in Firebase.
- **Fix**: In the Firebase Console, go to **Authentication** → **Sign-in method**, click **Email/Password**, toggle it to **Enabled**, and click **Save**.

### 3. "Missing or insufficient permissions" (Firestore Error)
- **Cause**: Your Firestore database is still using the default lock-down rules.
- **Fix**: In the Firebase Console, go to **Firestore Database** → **Rules**. Copy the entire contents of `firestore.rules` from this project, paste them in, and click **Publish**.

### 4. "storage/unauthorized" or Upload Failures
- **Cause**: Storage security rules are blocking contractor document or profile photo uploads.
- **Fix**: In the Firebase Console, go to **Storage** → **Rules**. Copy the entire contents of `storage.rules` from this project, paste them in, and click **Publish**. Also confirm that your uploaded files are under 5MB for images or under 10MB for verification PDFs.

### 5. Single-Page App 404 Error on Page Refresh in Production
- **Cause**: When a user refreshes a sub-route (e.g. `yourdomain.com/directory`), the static server looks for a physical file instead of serving `index.html`.
- **Fix**: 
  - For **Firebase Hosting**: Ensure `firebase.json` has `"rewrites": [ { "source": "**", "destination": "/index.html" } ]`.
  - For **Netlify**: Ensure a `public/_redirects` file exists with `/* /index.html 200`.
  - For **Vercel**: Add `"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]` in `vercel.json`.

### 6. npm install Errors / Dependency Conflicts
- **Cause**: Outdated Node.js version or corrupted npm cache.
- **Fix**: Verify your Node version (`node -v` should be v18 or v20+). Clean your npm cache and reinstall:
  ```bash
  npm cache clean --force
  rm -rf node_modules package-lock.json
  npm install
  ```

---

## 14. Security

As the platform owner, follow these essential security practices to protect yourself and your users:

1. **Use Your Own Firebase Project**: Never connect your app to a shared or untrusted Firebase project.
2. **Never Commit Secrets**: Keep `.env` listed in `.gitignore`. Never push `.env` to public GitHub repositories or public forums.
3. **Always Deploy Production Rules**: Always deploy the provided `firestore.rules` and `storage.rules`. Never leave Firestore or Storage in "test mode" with open public read/write permissions.
4. **Protect Your Admin Account**: Use a strong password (minimum 12 characters with symbols and numbers) for the email registered in `VITE_ADMIN_EMAIL`.
5. **Private Verification Documents**: The storage rules ensure that contractor driver's licenses and insurance papers in `/verification_docs/` can only be viewed by the contractor who uploaded them and verified directory administrators.
6. **Enable Firebase App Check (Recommended for High Traffic)**:
   For enterprise security against automated scrapers:
   - In the Firebase Console, go to **App Check**.
   - Register your web app using Google reCAPTCHA v3 or reCAPTCHA Enterprise.
   - Enforce App Check for Cloud Firestore and Firebase Storage.

---

## 15. License

This software is licensed under the terms of the digital purchase agreement accompanying this product.

- **Permitted Use**: You are granted a non-exclusive license to install, customize, brand, and deploy this software for your own commercial or personal local directory business.
- **Prohibitions**: You are strictly prohibited from reselling, redistributing, sublicensing, leasing, or publicly sharing the uncompiled source code or digital template as a competing digital product, theme, or code template.

---

## 16. Support

- **One-Time Source Code Product**: This software is sold as a self-hosted, one-time digital download.
- **What is Included**: The complete, tested, and working codebase, documentation, database rules, and configuration templates as described.
- **What is Not Included**: Ongoing developer hours, free custom feature requests, phone support, debugging of third-party modifications, or free upgrades to future versions.
- **Technical Competency**: The purchaser is expected to have basic familiarity with web technologies (Node.js, npm, terminal commands, and cloud hosting). If you require custom software engineering or bespoke features, you may hire an independent full-stack developer familiar with React and Firebase.

---

## 17. Final Checklist

Before launching your directory to the public, complete this checklist:

- [ ] Installed project dependencies using `npm install`
- [ ] Created your own Google Firebase project
- [ ] Enabled Firebase Authentication (Email/Password)
- [ ] Created Cloud Firestore Database in production mode
- [ ] Enabled Firebase Storage
- [ ] Published `firestore.rules` in Firestore Rules tab
- [ ] Published `storage.rules` in Storage Rules tab
- [ ] Created `.env` file and added all Firebase keys and `VITE_ADMIN_EMAIL`
- [ ] Started local server (`npm run dev`) and registered the Administrator account
- [ ] Verified that the **Operator Admin** button appears in the navigation
- [ ] Customized directory name, logo, primary color, and target city in Admin Branding
- [ ] Reviewed and customized the Terms of Service, Privacy Policy, and Disclaimers
- [ ] Removed all demo data using the **Remove Demo Data (1-Click)** button
- [ ] Ran `npm run build` to verify a successful production bundle
- [ ] Deployed to your hosting provider (Firebase Hosting, Vercel, or Netlify)
- [ ] Connected your custom domain name and verified SSL certificate

---

*Thank you for purchasing LocalVerity! We wish you immense success with your local services directory business.*
