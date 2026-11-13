// Creates (or resets) the Owner account. Run in your own terminal: npm run create-owner
require('dotenv').config();
const readline = require('readline');
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { isEmail, isPhone, isUsername, isStrongPassword } = require('../utils/validators');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, (a) => r(a.trim())));

(async () => {
  try {
    console.log("Create the Owner account for Nawin's Restaurant\n");
    const name = await ask('Full name: ');
    const email = await ask('Email: ');
    const phone = await ask('Phone: ');
    const address = (await ask('Address: ')) || "Nawin's Restaurant";
    const username = await ask('Owner username: ');
    const password = await ask('Password (min 8 chars, letters + numbers): ');

    if (!name || !isEmail(email) || !isPhone(phone) || !isUsername(username) || !isStrongPassword(password)) {
      throw new Error('Invalid input. Check email, phone, username (3-30 letters/numbers/_) and password rules.');
    }
    const hash = await bcrypt.hash(password, 10);
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing.length) {
      await pool.query('UPDATE users SET name=?, phone=?, address=?, password=?, role="owner" WHERE id=?',
        [name, phone, address, hash, existing[0].id]);
      console.log('\nExisting user updated and set as Owner.');
    } else {
      await pool.query(
        'INSERT INTO users (name,email,phone,address,username,password,role) VALUES (?,?,?,?,?,?,"owner")',
        [name, email, phone, address, username, hash]);
      console.log('\nOwner account created.');
    }
  } catch (err) {
    console.error('\n' + err.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await pool.end();
  }
})();
