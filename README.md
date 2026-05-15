# MerchFlow AI — The Intelligent B2B E-Commerce Marketplace

Welcome to the official documentation for **MerchFlow AI**. 

MerchFlow is a next-generation full-stack platform designed to bridge the gap between wholesale manufacturers and B2B buyers. It has evolved from a pure inventory management tool into a **Direct E-Commerce Marketplace**, leveraging Google Gemini AI to automate merchandising and high-fidelity builder tools to create immersive digital storefronts.

---

## 🏗 Core Pillars

1.  **🤖 AI-Powered Merchandising**: Automate product descriptions, attribute extraction, and catalog autofill using **Google Gemini 1.5 Flash**. Generate realistic garment previews with **Claid.ai Virtual Try-On**.
2.  **🛍 Unified Marketplace**: A centralized hub where buyers can browse showrooms, collect favorites into a global wishlist, and move from discovery to checkout in seconds.
3.  **🎨 Creative Builders**: Drag-and-drop **Showroom** and **Lookbook** builders that allow sellers to create stunning, high-converting digital catalogs without code.
4.  **📦 Seamless Fulfillment**: Transition from B2B negotiation (Quotes) to direct marketplace orders with unified tracking and CRM integration.

---

## 🛠 Tech Stack

### **Frontend (Vite + React)**
- **UI & Logic**: React 18, React Router DOM v7.
- **Styling & Animation**: Tailwind CSS, Framer Motion (for smooth micro-interactions).
- **Data Layer**: 
  - **TanStack React Query**: Server state, caching, and optimistic UI updates.
  - **Zustand**: Lightweight global state for Auth and UI preferences.
- **Components**: 
  - **Lucide React**: Iconography.
  - **dnd-kit**: Drag-and-drop engines for Showroom/Lookbook builders.
  - **Recharts**: Interactive dashboard analytics.
  - **Sonner**: High-performance toast notifications.
- **Forms**: React Hook Form + Zod validation.

### **Backend (Node.js + Express)**
- **Runtime**: Node.js (ES Modules).
- **ORM**: Prisma with PostgreSQL.
- **Intelligence Layer**:
  - **Google Generative AI**: Gemini 1.5 for text, vision, and catalog automation.
  - **Claid.ai**: Enterprise AI for fashion Virtual Try-On.
- **Security**: JWT (JsonWebToken), BcryptJS, CORS, Helmet, Rate Limiting.
- **Media & Files**:
  - **Multer**: Multipart file handling.
  - **Sharp**: High-performance image processing (WebP/JPEG conversion).
  - **Puppeteer**: Automated PDF generation for catalogs.
  - **XLSX / CSV-Parse**: Bulk data ingestion tools.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **PostgreSQL** (Port 5432)
- **API Keys**: Google Gemini API Key, Claid.ai API Key (optional for fallback).

### 1. Backend Configuration
Navigate to the `backend` folder and create a `.env` file:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/merchflow"
JWT_SECRET="your_secret_key"
GEMINI_API_KEY="your_google_ai_key"
CLAID_API_KEY="your_claid_key"
PORT=4000
```

### 2. Installation & DB Init
```bash
# In /backend
npm install
npx prisma db push
node prisma/seed.js # Optional: Populate with sample products & sellers

# In /frontend
npm install
```

### 3. Running Locally
```bash
# Terminal 1 (Backend)
cd backend && npm run dev

# Terminal 2 (Frontend)
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:4000/api`

---

## 📂 Project Feature Map

### **Seller Dashboard (Admin Tools)**
| Feature | Location | Logic |
| :--- | :--- | :--- |
| **Inventory** | `/inventory` | Bulk stock management and SKU tracking. |
| **Product Studio** | `/products/new` | AI attribute extraction and Gemini description generator. |
| **Showroom Builder** | `/showrooms` | Drag-and-drop block builder (`Hero`, `Products`, `Brand`). |
| **Lookbook Designer** | `/lookbooks` | PDF-ready digital catalogs with AI-assisted narratives. |
| **Data Importer** | `/imports` | CSV/Excel wizard for bulk product ingestion. |
| **Order Center** | `/orders` | Management of buyer checkouts and fulfillment status. |
| **Media Library** | `/media` | Centralized asset management with tagging. |

### **Buyer Marketplace (Shopping Experience)**
| Feature | Location | Logic |
| :--- | :--- | :--- |
| **Marketplace Home** | `/buyer/home` | Public discovery of brand showrooms and lookbooks. |
| **Showroom View** | `/buyer/showrooms/:id` | High-fidelity storefront for browsing and adding to wishlist. |
| **Global Wishlist** | `/buyer/wishlist` | Centralized collection of saved items across all showrooms. |
| **Quotes & Inquiry** | `/buyer/quotes` | Direct B2B inquiries and negotiation tracking. |
| **Checkouts** | `/buyer/orders` | History of converted quotes and direct orders. |

---

## 🤖 AI Orchestration Layer

The system uses a sophisticated AI pipeline located in `backend/src/routes/ai.js`:

- **Product Onboarding**: When a user uploads a photo, **Gemini Vision** extracts color, material, fit, and tags automatically.
- **Content Strategy**: **Gemini 1.5** generates three distinct marketing tones (Professional, Creative, Luxury) for every product.
- **Fashion Studio**: Integrates with **Claid.ai** to process asynchronous jobs. It uploads local garment images to a temporary public host, polls Claid for completion, and downloads the result back to the local media library.
- **Lookbook Narrative**: Analyzes the contents of a catalog and generates a cohesive seasonal brand story.

---

## 🔑 Key Architecture Decisions

1.  **Role Separation**: The system enforces strict UI boundaries between `SELLER` and `BUYER` roles. Buyers never see "Edit" or "Export" tools on public-facing pages.
2.  **Centralized Wishlist**: Unlike isolated showroom carts, the wishlist is global. This allows buyers to curate a multi-brand selection before proceeding to a single consolidated quote/order.
3.  **Live State Management**: Uses `react-query` to ensure that if a seller updates a product price in the dashboard, it reflects instantly on the buyer's wishlist and showroom pages.
4.  **Enum Normalization**: The `src/lib/api.js` client automatically converts backend Prisma constants (e.g., `CONVERTED_TO_ORDER`) into human-readable labels (e.g., `Converted to Order`) for the UI.

## 🚀 Detailed Feature Deep-Dive

### 📖 Catalog (Lookbooks)
The **Catalog** system is designed for visual storytelling and wholesale presentation.
- **Creative Builder**: Sellers organize products into themed collections with custom layouts.
- **AI Narrative**: Leverages **Google Gemini** to generate compelling "Brand Stories" and seasonal introductions based on product metadata.
- **B2B Distribution**: Supports high-fidelity **PDF exports** for offline sharing and digital links for online browsing.

### 🏬 Showroom
The **Showroom** acts as the high-converting storefront for the marketplace.
- **Block-Based Editor**: Drag-and-drop components like `Hero` banners, `Brand Intro`, and `Product Grids`.
- **Interactive Browsing**: Buyers can add products to a **Global Wishlist** or initiate checkouts directly from the showroom view.
- **Live Tracking**: Built-in `PageView` analytics to monitor storefront performance and buyer engagement.

### 🤖 AI Virtual Try-On
The flagship intelligence feature located in the **AI Studio**.
- **Garment Mapping**: Users upload a flat-lay garment and a model photo; the system merges them using the **Claid.ai** enterprise API.
- **Job Orchestration**: Features a robust background job system (QUEUED → PROCESSING → COMPLETED) with real-time progress tracking and notifications.
- **Media Integration**: Finished AI assets are automatically saved to the central **Media Library** for use in showrooms and lookbooks.

### 📦 Orders & Fulfillment
The bridge between B2B negotiation and marketplace commerce.
- **Quote-to-Order Flow**: Seamlessly converts negotiated **Quotes** into **Orders** upon approval.
- **Unified Management**: Centralized dashboard to track shipping status, SKU breakdowns, and fulfillment progress.
- **CRM Loop**: Every order updates the customer's **Lifetime Value (LTV)** and order history, providing sellers with actionable buyer insights.

---

Developed with ❤️ for the future of B2B Commerce.
