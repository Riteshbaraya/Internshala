# Implementation Flow Guide for Login Tracking & Subscription System

## 🔐 Feature 4: Track User Login & Device Restrictions

### 🎯 Objective:

- Track user's device, browser, OS, IP, and login time.
- Show login history on user profile.
- If logging in via Chrome browser, allow login only after OTP verification (via email).
- If logging in via mobile device, restrict access to **10 AM to 1 PM IST only**.

### 🧩 Dependencies (Use Free APIs & Packages Only):

- **useragent** – to detect OS, device, and browser.
- **express-useragent** – to extract user agent data.
- **node-fetch or axios** – for IP and geolocation.
- **nodemailer** – to send OTP.
- **moment-timezone** – to check time in IST.

### 🛠️ Flow:

#### 1. Capture Login Info

- Use `req.headers['user-agent']` to get device/browser/OS.
- Use a service like `ipapi.co/json/` to get IP address and location.

#### 2. Parse Agent Info

```js
const useragent = require('express-useragent');
app.use(useragent.express());
```

#### 3. OTP Verification (for Chrome)

- If browser is `Chrome`, generate 6-digit OTP and email it using nodemailer.
- Store OTP in DB with short TTL (\~5 mins).
- Prompt user to enter OTP before allowing login session.

#### 4. Time Restriction for Mobile Devices

- Check if device is mobile:

```js
if (req.useragent.isMobile) {
   const currentIST = moment().tz('Asia/Kolkata');
   const hour = currentIST.hour();
   if (hour < 10 || hour > 13) return res.status(403).send('Access only allowed between 10 AM to 1 PM IST');
}
```

#### 5. Save Login Info

- Store login session details:

```js
{
  userId,
  ipAddress,
  browser,
  os,
  device,
  time: new Date()
}
```

#### 6. Display Login History

- Create `/my-logins` route to show user's past login sessions from DB.

---

## 💳 Feature 5: Subscription Plan with Payment Gateway

### 🎯 Objective:

- Free plan: 1 application only
- Bronze: ₹100/month (3 applications)
- Silver: ₹300/month (5 applications)
- Gold: ₹1000/month (Unlimited)

### ⏳ Payment Time Restriction:

- Payments can only be done between **10 AM to 11 AM IST**

### 🔧 Tools:

- **Razorpay (Free test account)**
- **Razorpay Orders API** – for creating test payments
- **nodemailer** – to send invoice and plan confirmation

### 🛠️ Flow:

#### 1. Setup Razorpay

- Create account at [https://razorpay.com](https://razorpay.com)
- Use test keys in `.env`

```env
RAZORPAY_KEY=your_key
RAZORPAY_SECRET=your_secret
```

#### 2. Plan Logic on Backend

- Define plan limits in backend config or DB:

```js
const plans = {
  free: { name: 'Free', limit: 1, price: 0 },
  bronze: { name: 'Bronze', limit: 3, price: 100 },
  silver: { name: 'Silver', limit: 5, price: 300 },
  gold: { name: 'Gold', limit: Infinity, price: 1000 },
};
```

#### 3. Payment Time Check

- In payment route, check IST time:

```js
const currentIST = moment().tz('Asia/Kolkata');
if (currentIST.hour() !== 10) return res.status(403).send('Payment allowed only between 10-11 AM IST');
```

#### 4. Razorpay Order & Payment

```js
const Razorpay = require("razorpay");
const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY, key_secret: process.env.RAZORPAY_SECRET });

const order = await razorpay.orders.create({
  amount: plan.price * 100,
  currency: "INR",
  receipt: `receipt_order_${Date.now()}`,
});
```

#### 5. Save Subscription Info

- On successful payment webhook or callback:

```js
{
  userId,
  planName,
  amountPaid,
  invoiceId,
  startedAt,
  validTill
}
```

#### 6. Send Invoice Email

```js
sendEmail(user.email, 'Subscription Successful', `
  Hi [Name],

  Thank you for subscribing to the ${plan.name} Plan.

  💳 Amount: ₹${plan.price}
  📅 Start Date: ${start}
  🧾 Invoice ID: ${invoiceId}

  Regards,
  InternArea Team
`);
```

---

### 📝 Notes:

- ✅ All features are implemented using **free packages and APIs**.
- ✅ Compatible with your **existing working project** without changing existing core logic.
- ✅ Razorpay test account is free to use with unlimited payments in test mode.
- ✅ Nodemailer uses Gmail with app password (also free).

---

Let me know if you want code snippets for each route or you want this in Hindi.

