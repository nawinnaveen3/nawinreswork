# Nawin's Restaurant - Full-Stack Restaurant Management

React (Vite) + Node.js/Express + MySQL. Two portals: **Customer** and **Owner**.
The menu starts **empty**: nothing is hard-coded. Only the Owner adds foods and categories.

```
nawins-restaurant/
├── server/   Express REST API (JWT, bcrypt, MySQL)
└── client/   React app (React Router, Recharts, Lucide icons)
```

## Quick start (one command)
From the project root (`nawins-restaurant/`):
```bash
npm install          # installs root + server + client packages
# (one time) create server/.env from server/.env.example and set DB_PASSWORD + JWT_SECRET
# (one time) npm run setup-db      <- or run server/sql/schema.sql in MySQL Workbench
# (one time) npm run create-owner
npm run dev          # starts API (5000) and website (5173) together
```

## Setup (about 10 minutes, step by step)

### Step 1 - Install the tools
1. Node.js 18 or newer (LTS) from https://nodejs.org. Check: `node -v` and `npm -v`.
2. MySQL Server 8 and MySQL Workbench from https://dev.mysql.com/downloads/ (remember the root password you set).

### Step 2 - Create the database (MySQL Workbench)
1. Open Workbench and connect to your local MySQL instance.
2. File > Open SQL Script > choose `server/sql/schema.sql`.
3. Click the lightning-bolt button to run the whole script.
4. In the left panel click Refresh. Under **nawins_restaurant > Tables** you should see
   `users, categories, menu_items, orders, order_items, contact_messages`. All are empty.

(Alternative without Workbench: after Step 3 and 4 run `npm run setup-db` inside `server/`.)

### Step 3 - Configure the backend
```bash
cd server
cp .env.example .env        # Windows: copy .env.example .env
```
Open `.env` and set `DB_PASSWORD` (your MySQL root password) and `JWT_SECRET` (any long random string).
Tax (`TAX_RATE`), delivery fee (`DELIVERY_CHARGE`) and currency symbol are also set here.

### Step 4 - Install and start the backend
```bash
npm install
npm run create-owner        # asks for the Owner's name, email, phone, username and password
npm run dev                 # API on http://localhost:5000
```
You should see `API running on http://localhost:5000`. Test: open http://localhost:5000/api/health.
`create-owner` is the only way to create an Owner. No Owner password exists in any code file.

### Step 5 - Install and start the frontend (new terminal)
```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```
The Vite dev server proxies `/api` and `/uploads` to port 5000, so no extra config is needed.

## Test both portals
1. Open http://localhost:5173/owner/login and log in with the Owner you created.
2. **Categories**: add your own (for example Starters, Main Course).
3. **Menu Management > Add Food**: add foods (upload an image or paste an image URL).
4. Open http://localhost:5173/menu in a private window: your foods appear. Before you add any, it shows
   "No menu items available at the moment."
5. Register a customer at /register, log in at /login, add foods to the cart, check out.
6. Back in the Owner portal: Orders > move the order through Confirmed > Preparing > Ready > Out for Delivery > Delivered.
7. Customer > My Orders shows the new status. Dashboard and Sales & Reports update from MySQL.
8. Edit a food, mark it Unavailable (customers see "Currently Unavailable" and cannot add it), then delete it (it disappears).

## API overview
| Area | Endpoints |
|---|---|
| Auth | POST `/api/auth/register`, `/customer-login`, `/owner-login`, `/logout` |
| Menu | GET `/api/menu`, GET `/api/menu/:id`; Owner: POST, PUT `/:id`, DELETE `/:id` |
| Categories | GET `/api/categories`; Owner: POST, PUT `/:id`, DELETE `/:id` |
| Orders | POST `/api/orders`, GET `/api/orders`, GET `/api/orders/:id`, PUT `/api/orders/:id/status` (Owner) |
| Customers | GET `/api/customers` (Owner), GET `/api/customers/:id`, PUT `/api/customers/:id` (own profile) |
| Contact | POST `/api/contact`; GET `/api/contact` (Owner) |
| Dashboard (Owner) | GET `/api/dashboard/statistics`, `/sales?group=day|week|month&from=&to=`, `/popular-items` |
| Extra | GET `/api/settings` (tax, delivery fee, currency), GET `/api/health` |

## Notes
- Order totals are always recalculated on the server from MySQL prices. The browser cannot change prices.
- `order_items` stores the food name too, so order history stays intact if a food is deleted later.
- Deleting a category keeps its foods on the menu with no category.
- "Online Payment" is a placeholder; only Cash on Delivery is processed.
- Hero/About photos use Unsplash URLs, and Google Fonts load from the internet. Replace the text on the About
  and Contact pages (address, phone, hours, story, chef) with your real details.
- Production: run `npm run build` in `client/`, serve `client/dist`, set `VITE_API_URL` to your API URL, and set
  `CLIENT_URL` in `server/.env` to your site's address.

## Troubleshooting
- `Unable to connect to MySQL`: check `DB_*` in `server/.env`, and that MySQL is running and the SQL script was run.
- `ER_NOT_SUPPORTED_AUTH_MODE` / auth plugin error: in Workbench run
  `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password'; FLUSH PRIVILEGES;`
- `bcrypt` install errors on Windows: use Node LTS and re-run `npm install`.
- Port busy: change `PORT` in `server/.env` and the proxy target in `client/vite.config.js`.
