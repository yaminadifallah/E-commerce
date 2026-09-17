# E-COMMERCE — Full-Stack E-Commerce Platform

A production-architected, multi-category e-commerce platform: customer storefront, cart & checkout with wilaya-based delivery, and a full staff/admin dashboard — built on **React + Vite**, **Express**, **Prisma**, and **MySQL**.

---

## 1. Project Overview

This is a real, database-driven full-stack application — not a static demo. Every product, category, color, order, wilaya and delivery price comes from MySQL through Prisma. Nothing is hardcoded in the React code.


 E-COMMERCE is a general store, not just phone accessories. The seeded catalog spans **9 categories**: Phone Accessories, Baby Products (مستلزمات الأطفال), Gifts (Cadeaux), Kids' Toys (Jeux des enfants), Perfumes (Parfums), School Supplies (Les affaires scolaires), Women's Accessories, Makeup, and Electronics (الكترونيات).

**Customer-facing features:** product catalog with search/filter/sort, product colors, promotions, cart (persisted in localStorage), checkout with wilaya-based delivery pricing fetched live from the database, order confirmation, delivery info page, contact page, **English / French / Arabic** language switching (with right-to-left layout for Arabic), and a **light/dark theme toggle**.

**Admin features:** JWT-protected dashboard with charts (Recharts), full product CRUD with multi-image upload, a **CSV bulk-import tool** to add many products at once, a dedicated **promotions manager**, category & color management, order management with a quick inline status-change dropdown, wilaya & delivery-office management, store settings, an **out-of-stock category alert bell**, and **staff account management with a full activity log** so the store owner can see exactly what each admin/seller did.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, Lucide React, Framer Motion, Recharts |
| Backend | Node.js, Express, JWT, bcryptjs, Multer, express-validator, Helmet, CORS |
| Database | MySQL + Prisma ORM |

---

## 3. Project Structure

```
phone-accessories-shop/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/             # Axios instance
│   │   ├── components/      # Navbar, Footer, ProductCard, admin/*
│   │   ├── context/         # CartContext, AuthContext, ThemeContext, LanguageContext
│   │   ├── i18n/            # translations.js (en / fr / ar)
│   │   └── pages/           # Storefront pages + admin/* pages
│   ├── package.json
│   └── vite.config.js
├── server/                  # Express + Prisma backend
│   ├── prisma/
│   │   ├── schema.prisma    # Full database schema (incl. ActivityLog)
│   │   └── seed.js          # Seed data (admin+seller accounts, categories, products, wilayas...)
│   ├── src/
│   │   ├── routes/          # Public + /admin routes (products, users, promotions, etc.)
│   │   ├── middleware/      # auth, upload, error handling
│   │   └── utils/           # prisma client, helpers, activityLog
│   ├── uploads/products/    # Uploaded product images (local dev storage)
│   ├── package.json
│   └── .env.example
├── README.md
└── .gitignore
```

---

## 4. Requirements

Install these first:

- **Node.js** (v18 or newer) — https://nodejs.org
- **XAMPP** (provides MySQL + phpMyAdmin) — https://www.apachefriends.org
- **VS Code** (or any editor)
- **Git** (optional, for version control)

---

## 5. Local Setup — Step by Step (Windows + XAMPP)

### Step 1 — Install Node.js
Download and install the LTS version from nodejs.org. Verify it worked:
```
node -v
npm -v
```

### Step 2 — Install and start XAMPP
1. Download and install XAMPP.
2. Open the **XAMPP Control Panel**.
3. Click **Start** next to **MySQL**. Wait until it turns green.
4. (Apache is not required for this project — MySQL is all we need.)

### Step 3 — Create the database in phpMyAdmin
1. Open your browser and go to: `http://localhost/phpmyadmin`
2. Click **New** in the left sidebar.
3. Enter the database name: `phone_accessories_shop`
4. Click **Create**.

That's it — you don't need to create tables manually; Prisma migrations do that next.

### Step 4 — Get the project onto your machine
Copy the `phone-accessories-shop` folder to your computer (e.g. `C:\Projects\phone-accessories-shop`), or clone it from Git if you've pushed it there.

### Step 5 — Configure the backend environment
```
cd server
copy .env.example .env      (Windows)
# or: cp .env.example .env   (Mac/Linux)
```
Open `server/.env` in VS Code and check the `DATABASE_URL`. The default XAMPP MySQL user is `root` with an **empty password**, so the default value already works:
```
DATABASE_URL="mysql://root:@localhost:3306/phone_accessories_shop"
```
If your MySQL root user has a password, update it:
```
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/phone_accessories_shop"
```
Also change `JWT_SECRET` to any long random string.

### Step 6 — Install backend dependencies
```
cd server
npm install
```

### Step 7 — Generate the Prisma client
```
npx prisma generate
```

### Step 8 — Run the database migration
This creates all tables (users, activity logs, products, categories, orders, wilayas, etc.) in MySQL:
```
npx prisma migrate dev --name init
```
You should see "Your database is now in sync with your schema."

> If you're updating an existing local database from an earlier version of this project (before staff accounts / activity log existed), just run the same command again with a new migration name, e.g. `npx prisma migrate dev --name add_activity_log`. It only adds the new table — your existing data is untouched.

### Step 9 — Seed the database
This fills the database with an admin account, a demo seller account, categories, colors, sample products across all categories, all 58 wilayas, and delivery offices:
```
npm run seed
```
You'll see console output confirming each step.

> **Default accounts (development only):**
> | Role | Email | Password |
> |---|---|---|
> | Admin (full access + staff management) | `admin@nabilhmz.dz` | `Admin@12345` |
> | Seller (demo staff account) | `seller@nabilhmz.dz` | `Seller@12345` |
>
> ⚠️ **Change these passwords immediately** after your first login in a real deployment. Never leave the default credentials in place on a live store.

### Step 10 — Start the backend server
```
npm run dev
```
You should see: `✅ Server running on http://localhost:5000`

Leave this terminal running.

### Step 11 — Install and start the frontend
Open a **second terminal**:
```
cd client
npm install
npm run dev
```
You should see Vite output with a local URL.

### Step 12 — Open the website
- **Storefront:** http://localhost:5173
- **Admin login:** http://localhost:5173/admin/login

You're done! Browse products, add to cart, check out, and log into the admin panel to manage everything.

---

## 6. Exact Local URLs

| Service | URL |
|---|---|
| Frontend (storefront + admin) | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| phpMyAdmin (view database) | http://localhost/phpmyadmin |
| Prisma Studio (view/edit database visually) | http://localhost:5555 |

If you change the backend port in `server/.env` (`PORT=...`), also update the proxy target in `client/vite.config.js`.

---

## 7. Viewing the Database

**Option A — phpMyAdmin**
Go to `http://localhost/phpmyadmin`, click the `phone_accessories_shop` database in the sidebar, and browse tables like `products`, `orders`, `users`, `categories`, `wilayas`.

**Option B — Prisma Studio**
From the `server` folder:
```
npx prisma studio
```
This opens a visual, editable database browser at `http://localhost:5555` — often easier to use than phpMyAdmin for quick edits during development.

---

## 8. How Data Flows

**Customer storefront:**
```
React (client)  →  Axios  →  Express API  →  Prisma  →  MySQL
```

**Admin dashboard:**
```
React Admin (client)  →  Axios (with JWT)  →  Express API (/api/admin/*)  →  Prisma  →  MySQL
```

Every price shown to a customer, every stock count, and every delivery fee is read from MySQL at request time. When an order is placed, the backend re-reads current prices and stock from the database inside a transaction — it never trusts numbers sent by the browser.

---

## 9. Image Storage

In local development, uploaded product/category/logo images are stored on disk at:
```
server/uploads/products/
```
and served by Express as static files at:
```
http://localhost:5000/uploads/products/<filename>
```
The React frontend requests these through the Vite dev proxy, so `imageUrl()` in `client/src/api/axios.js` builds the correct path automatically.

**Moving to cloud storage later:** the upload logic is isolated in `server/src/middleware/upload.js` (Multer disk storage) and each route that creates image records. To switch to Cloudinary/S3/etc., you'd only need to change `upload.js` to a memory/cloud storage engine and update the `imageUrl` field written to the database — no changes needed anywhere else in the app.

---

## 10. Seed Data

Running `npm run seed` (from `server/`) creates:
- 1 admin account and 1 demo seller account (see credentials table above)
- 9 categories: Phone Accessories, Baby Products, Gifts, Kids' Toys, Perfumes, School Supplies, Women's Accessories, Makeup, Electronics
- 10 colors
- 30 realistic sample products spread across every category (some in promotion, a couple out of stock, one low-stock)
- All 58 wilayas of Algeria with delivery prices and estimated delivery times
- Delivery offices for major wilayas (Algiers, Oran, Constantine, Blida, Sétif, Béjaïa)
- Default store settings

The seed script is idempotent for categories/wilayas/colors (safe to re-run) using `upsert`/find-or-create patterns.

---

## 10a. Staff Accounts & Activity Log

Only **Admin**-role accounts can manage staff. From `/admin/users` ("Staff & Activity" in the sidebar — only visible to Admins):
- **Add Staff Account** creates a new Admin or Seller login.
- **Sellers** can manage products, orders, categories, colors, promotions, wilayas and delivery offices, but cannot create/deactivate other staff accounts or view the activity log.
- Every meaningful action (order status changes, product create/update/delete, promotion changes, staff account changes, bulk imports) is recorded in the **Activity Log** tab, showing who did what and when. You can filter the log to a single staff member.
- Deactivating a staff account (instead of deleting it) keeps their activity history intact. A user cannot deactivate their own account.

## 10b. Promotions

`/admin/promotions` is the dedicated place to manage discounts: search any product, set or clear its promotion price inline, and see the live discount percentage. The storefront's `/promotions` page and the `-X%` badges everywhere else are driven entirely by this.

## 10c. Category Stock Alerts

The bell icon in the top-right of the admin panel polls `/api/admin/dashboard/alerts` every 60 seconds. It flags:
- Any **category where every active product is out of stock** (a whole category has "run out"), with a link straight to that category's products.
- A count of products that are low on stock (5 or fewer left).

## 10d. Bulk Product Import

`/admin/products/bulk-import` lets you add many products in one go via CSV: download the template, fill it in (columns: `name`, `description`, `price`, `promotionPrice`, `stock`, `categoryName`, `colorNames`, `featured`, `active`), upload it, preview the parsed rows, and import. `categoryName` must match an existing category name exactly; `colorNames` is a comma-separated list of existing color names (e.g. `"Black,White"`). Rows with errors are skipped and listed individually — valid rows are still created.

## 10e. Languages & Theme

The storefront switches between **English, French, and Arabic** from the globe icon in the navbar — Arabic automatically switches the whole layout to right-to-left. The sun/moon icon next to it toggles **light/dark mode**; both preferences are remembered in the browser via `localStorage`. Translation strings live in `client/src/i18n/translations.js` — add a new key there (and to all three language objects) to translate more of the UI.

---

## 11. Troubleshooting

**MySQL won't start in XAMPP**
Usually port 3306 is already used by another MySQL instance. Stop any other MySQL service (Task Manager → Services), or change the MySQL port in XAMPP's `my.ini` and update `DATABASE_URL` accordingly.

**"Port 3306 already in use"**
Same as above — another MySQL server is running. Either stop it or change XAMPP's MySQL port.

**"node is not recognized as a command"**
Node.js isn't installed or isn't in your PATH. Reinstall Node.js and restart your terminal/computer.

**"npm is not recognized"**
Same cause as above — npm ships with Node.js. Reinstall Node.js.

**Prisma can't connect to the database**
- Confirm MySQL is running in XAMPP (green light).
- Double-check `DATABASE_URL` in `server/.env` — username, password, host, port, database name.
- Make sure the database `phone_accessories_shop` actually exists in phpMyAdmin.

**"Database does not exist" error**
Create it manually in phpMyAdmin (see Step 3) before running `npx prisma migrate dev`.

**CORS error in the browser console**
Make sure `CLIENT_URL` in `server/.env` matches the URL the frontend is actually running on (default `http://localhost:5173`), and restart the backend after changing `.env`.

**Frontend can't reach the backend / network errors**
Confirm the backend terminal shows `Server running on http://localhost:5000`. In dev, the frontend talks to the backend through the Vite proxy in `client/vite.config.js` — make sure that file's proxy target matches your backend port.

**Image upload not working**
- Check the file is JPG, JPEG, PNG, or WEBP and under 5MB.
- Confirm `server/uploads/products/` exists (it's created automatically on server start).
- Check the browser console / backend terminal for the exact error message.

**JWT / "Invalid or expired session" errors**
Log out and log back in. If it persists, make sure `JWT_SECRET` in `server/.env` hasn't changed since you logged in (changing it invalidates all existing tokens).

**"Access restricted" on the Staff & Activity page**
This page is only available to Admin-role accounts. Log in with an Admin account (e.g. the seeded `admin@nabilhmz.dz`), or ask an Admin to change your account's role from `/admin/users`.

**CSV bulk import reports errors for every row**
The most common cause is `categoryName` not matching an existing category exactly (case-insensitive, but spelling must match). Check `/admin/categories` for the exact names, or download a fresh template from the import page.

**Migration errors ("drift detected", etc.)**
In development, you can reset the database (⚠️ this deletes all data):
```
npx prisma migrate reset
```
Then re-run `npm run seed`.

---

## 12. Production Build

Build the frontend for deployment:
```
cd client
npm run build
```
This outputs static files to `client/dist/`, ready to be served by any static host.

The backend runs the same way in production as in development, just with `npm start` instead of `npm run dev`, and `NODE_ENV=production` in `.env`.

---

## 13. Production Deployment

Your local XAMPP MySQL database is **not accessible from the public internet** — it only runs on your machine. Production requires a remote, publicly reachable MySQL database plus a hosted backend. Two common approaches:

### Option A — Split hosting (recommended for most stores)
- **Frontend:** deploy `client/` (after `npm run build`) to **Vercel** or **Netlify**.
- **Backend:** deploy `server/` to **Render**, **Railway**, or similar Node.js hosting.
- **Database:** use a managed MySQL provider (Railway MySQL, PlanetScale, AWS RDS, DigitalOcean Managed MySQL, etc.).

Steps:
1. Create the cloud MySQL database and copy its connection string.
2. Set the backend host's environment variables: `DATABASE_URL` (cloud string), `JWT_SECRET`, `CLIENT_URL` (your deployed frontend URL), `PORT`.
3. On first deploy, run `npx prisma migrate deploy` against the cloud database (most hosts let you run a one-off build/release command).
4. Run the seed script once (or create your admin/categories manually) — do **not** leave the default admin password in production.
5. Set the frontend host's environment variable `VITE_API_URL` to your deployed backend's URL (e.g. `https://your-api.onrender.com/api`), then rebuild.

### Option B — Single full-stack host
Use a host that supports both Node.js and MySQL (e.g. a VPS, or a platform offering both services together). Deploy `server/` and `client/dist/` (served via Express `express.static` or a reverse proxy like Nginx) to the same host. Point the same production `DATABASE_URL` at the host's MySQL instance.

### Production Environment Variables
**Backend (`server/.env` on the host):**
```
DATABASE_URL="mysql://user:password@your-cloud-host:3306/phone_accessories_shop"
JWT_SECRET="a-long-random-production-secret"
PORT=5000
CLIENT_URL="https://www.mystore.com"
UPLOAD_DIR="./uploads"
NODE_ENV="production"
```
**Frontend (build-time variable):**
```
VITE_API_URL="https://api.mystore.com/api"
```

### Connecting a domain
1. Point your domain's DNS `A`/`CNAME` records at your frontend host (Vercel/Netlify handle this with a simple dashboard setting).
2. Point a subdomain (e.g. `api.mystore.com`) at your backend host, if it supports custom domains.
3. Both hosts issue free HTTPS certificates automatically once DNS is verified.
4. Update `VITE_API_URL` (frontend) and `CLIENT_URL` (backend) to the final HTTPS domains, then redeploy.

The application code never assumes `localhost` — every URL is driven by `VITE_API_URL` on the frontend and `CLIENT_URL`/`DATABASE_URL` on the backend, so switching from local to production only requires environment variable changes.

### Production database migrations
Never expose your XAMPP MySQL to the internet. In production, always run:
```
npx prisma migrate deploy
```
against your cloud database (this applies existing migrations without prompting, unlike `migrate dev`).

---

## 14. Git / GitHub

```
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/phone-accessories-shop.git
git push -u origin main
```
`.gitignore` already excludes `node_modules/`, `.env`, `dist/`, and uploaded image contents. **Never commit your real `.env` file** — only `.env.example` should be in version control.

---

## 15. Security Notes

- Passwords are hashed with bcrypt — never stored in plain text.
- JWTs protect all `/api/admin/*` routes; the login endpoint is rate-limited against brute force.
- All prices and totals are recalculated server-side on every order — the frontend's numbers are never trusted.
- Uploaded files are validated by MIME type, extension, and size before being saved with a randomly generated filename.
- Stock decrements happen inside a database transaction, so two simultaneous orders can never oversell the same item.
- Products, categories, wilayas, and delivery offices that appear in historical orders are soft-deleted (deactivated) instead of removed, so past order records always stay valid.
- Staff routes are role-gated: only Admin accounts can create/deactivate other staff or view the activity log; Sellers are limited to day-to-day store operations (products, orders, promotions, etc.).
- Every status change, product edit, promotion change, and staff action is written to the `activity_logs` table with the acting user's ID — this audit trail cannot be edited or deleted through the API.
