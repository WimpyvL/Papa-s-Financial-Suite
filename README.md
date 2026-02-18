# Papa's Signs Financial Suite 📊

A comprehensive, AI-powered financial management and ERP system designed specifically for the printing and signage industry. Built with React, TypeScript, and Tailwind CSS.

## 🚀 Key Features

### 🧠 AI-Powered Insights
*   **Gemini Financial Advisor:** Integrated Google Gemini AI to analyze transaction history, revenue trends, and stock levels to answer natural language queries (e.g., "How is profit compared to last week?").
*   **Smart Parsing:** AI capabilities to parse raw text into structured invoice data.

### 💰 Point of Sale (POS)
*   **Retail Interface:** Fast product lookup and category filtering.
*   **Cart Management:** Adjust quantities, apply discounts, and handle tax.
*   **Park Sales:** Hold active carts and restore them later (great for busy counters).
*   **Receipts:** Digital receipt generation.

### 📝 Document Editor (Invoices & Quotes)
*   **Visual Designer:** Real-time split-screen editor for Invoices and Quotes.
*   **Theming:** Custom branding (Colors, Fonts).
*   **Templates:** Choose from 5 visual styles: Modern, Classic, Minimal, Bold, and Corporate.
*   **Workflow:** Convert Quotes to Jobs, then to Invoices.

### 🛠 Job & Workflow Management
*   **Kanban-style Logic:** Track jobs from Quote -> Deposit -> Production -> Completion.
*   **Profitability Engine:** Real-time margin calculation based on material/labor costs vs. quote total.
*   **Project Management:** Track deposits, balances, and production notes.

### 📦 Inventory Management
*   **Stock Tracking:** Real-time stock decrements from POS and Invoices.
*   **Receiving:** Dedicated interface for restocking and calculating average unit costs.
*   **Low Stock Alerts:** Visual indicators for items running low.

### 🏦 Banking & Ledger
*   **Multi-Account:** Track Petty Cash, Undeposited Funds, and Bank Accounts.
*   **Transaction History:** Full ledger of all sales, expenses, and transfers.
*   **Expense Recording:** Categorize operational expenses (Rent, Utilities, etc.).

## 🛠 Tech Stack

*   **Frontend:** React 19, TypeScript
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **Charts:** Recharts
*   **AI:** Google GenAI SDK (`@google/genai`)
*   **State Management:** React Context API

## ⚙️ Setup & Installation

1.  **Environment Configuration**
    The application requires a valid Google Gemini API Key to function fully (for the Dashboard AI insights).
    Ensure `process.env.API_KEY` is available in your environment.

2.  **Dependencies**
    This project uses ESM Modules via CDN (esm.sh) defined in `index.html` for rapid prototyping without a heavy build step.
    *   React
    *   Tailwind CSS (Script)
    *   Google GenAI SDK

3.  **Running the App**
    Serve the root directory using any static file server.
    ```bash
    npx serve .
    ```

## 📂 Project Structure

```text
/
├── components/       # UI Components and Feature Modules
│   ├── UI.tsx        # Reusable primitives (Buttons, Inputs, Modals)
│   ├── DocumentEditor.tsx # Invoice/Quote Designer
│   ├── POS.tsx       # Point of Sale Logic
│   └── ...           # Other feature components
├── context/          # Global State (FinancialContext)
├── services/         # API Services (Gemini AI integration)
├── types.ts          # TypeScript Interfaces
├── App.tsx           # Main Router/Layout
└── index.html        # Entry point & Import Maps
```

## ⚠️ Important Note on Data Persistence

This application currently runs as a **Client-Side Demo**. All data (Invoices, Transactions, Inventory changes) is stored in the browser's memory via React Context.

**Refreshing the page will reset the data to default values.**

For a production environment, this should be connected to a backend (Node.js/Python) and a database (PostgreSQL/MongoDB).

## 📄 License

MIT License. Free to use and modify.
