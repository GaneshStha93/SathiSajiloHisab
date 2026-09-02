# Sathi Sajilo Hisab (साथी सजिलो हिसाब) - Google Apps Script Engine

This folder contains the complete, standalone Google Apps Script (`Code.gs`) to automate and link your **7-member 25-day cooperative/saving circle** directly in Google Sheets.

---

## 📁 File Contents

- **`Code.gs`**: The full Google Apps Script macro & Web App API code.
- **`README.md`**: Complete step-by-step installation, deployment, and alternative usage guide.

---

## 🚀 How to Install & Run in Google Sheets (Step-by-Step)

### Step 1: Create a New Google Spreadsheet
1. Open your web browser and go to [https://sheets.new](https://sheets.new).
2. Name your spreadsheet: **`Sathi Sajilo Hisab - 25-Day ERP`**.

### Step 2: Open Apps Script Editor
1. In the top Google Sheets menu, click **Extensions** → **Apps Script**.
2. A new tab will open with the Apps Script code editor.

### Step 3: Paste the Code
1. Delete any sample code inside `Code.gs` (e.g. `function myFunction() {}`).
2. Copy all code from `google-apps-script/Code.gs` and paste it into the editor.
3. Click the **Save** icon (💾 or `Ctrl + S`).

### Step 4: Run the Auto-Initializer
1. In the toolbar at the top of the Apps Script editor, locate the **Select function to run** dropdown.
2. Select **`initSathiSajiloHisab`**.
3. Click the **▶ Run** button.
4. When prompted with **"Authorization Required"**, click **Review Permissions** → Choose your Google Account → Click **Advanced** → **Go to Untitled project (unsafe)** → Click **Allow**.
5. Switch back to your Google Sheets tab. You will see all 9 tabs created, formatted, and loaded with sample accounting data:
   - 📊 **Dashboard** (Live KPIs, total savings, cash/bank balance)
   - 📁 **Chart_of_Accounts** (3-Tier CoA with 40+ ledgers)
   - 📖 **Day_Book** (Journal register with DR/CR balances)
   - 👥 **Members_Directory** (7 friends circle, Rs 1,000/day x 25 days)
   - 💳 **Loan_Amortization** (25-day interest calculator & 12-month schedule)
   - 📈 **Profit_and_Loss** (Operating income vs. staff salary & expenses)
   - ⚖️ **Balance_Sheet** (Assets = Liabilities + Equity)
   - 📋 **Memberwise_Report** (7-member columnar matrix)

### Step 5: (Optional) Set up Monthly 25th Auto-Trigger
1. Back in Apps Script editor, select **`installMonthlyInterestTrigger`** from the function dropdown.
2. Click **▶ Run**.
3. Google Sheets will now automatically calculate and post the 25-day loan interest journals on the 25th of every month at 5:00 PM!

### Step 6: (Optional) Deploy as Live Web App API
1. Click **Deploy** (top right) → **New deployment**.
2. Click the gear icon (⚙️) next to "Select type" and choose **Web app**.
3. Description: `Sathi Sajilo Hisab API`.
4. Execute as: **Me**.
5. Who has access: **Anyone** (or your organization).
6. Click **Deploy** and copy your **Web App URL**.

---

## 🔄 Alternative Ways to Use Sathi Sajilo Hisab

If you don't want to use Google Apps Script or prefer other tools:

### Alternative 1: Use the Web ERP directly (Zero setup required)
- Open the web application preview.
- All double-entry voucher validation, Nepali/English dual calendars, member passbooks, and 25-day cycle loan amortization schedules are built into the web app and work out of the box with zero external dependencies.

### Alternative 2: Export CSV / Excel files
- In the web app:
  - Go to **Financial Statements** → click **Export CSV** (downloads P&L or Balance Sheet).
  - Go to **Loan Amortization** → click **Export CSV** (downloads the full 12-month payment table).
  - You can open these `.csv` files in Microsoft Excel, Google Sheets, or Apple Numbers.

### Alternative 3: Printable PDF / Paper Passbooks
- Every screen in the Web ERP features a **"Print Report"** or **"Print Table"** button (or press `Ctrl + P`) formatted for standard A4 paper for committee meetings and member passbooks.
