# Picture Gallery App

A modern Next.js application for managing and displaying pictures with categorization and sorting features.

## Features

- 📸 **Picture Upload**: Admin can upload pictures with drag-and-drop support (up to 50MB per file)
- 🏷️ **Category Management**: Create and manage picture categories with custom colors
- 🔍 **Smart Filtering**: Public users can sort pictures by category using dropdown or tabs
- 📥 **Bulk Download**: Download all pictures in the current category as a zip file
- 👤 **Admin Panel**: Secure admin interface for content management
- ☁️ **Cloud Storage**: Uses Vercel Blob for reliable image hosting
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 💾 **Data Persistence**: All data is stored and persists between sessions

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: Vercel Blob for images, Neon for database
- **Icons**: Lucide React
- **File Processing**: JSZip for creating zip archives, file-saver for downloads
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Vercel account (for deployment and blob storage)
- A Neon account (for PostgreSQL database)

### Local Development

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd pictures-sorting
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env.local
   ```

4. **Set up Neon Database**

   **Create Neon project:**

   - Go to [Neon Console](https://console.neon.tech/)
   - Create a new project
   - Copy the database connection string

   **Update your `.env.local`:**

   ```bash
   DATABASE_URL="postgresql://username:password@hostname:5432/database_name?sslmode=require"
   BLOB_READ_WRITE_TOKEN=xxx # Your Vercel Blob token (get from Vercel dashboard)
   ```

5. **Set up database**

   ```bash
   npx prisma db push
   npm run db:seed
   ```

6. **Run the development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Admin Access

- **Login URL**: `/admin/login`
- **Default Password**: `admin123`
- **Change Password**: Edit the password in `src/app/admin/login/page.tsx`

## Deployment to Vercel

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project

3. **Set up Environment Variables**

   - In your Vercel project dashboard, go to "Settings" → "Environment Variables"
   - Add your Neon database URL: `DATABASE_URL`
   - The `BLOB_READ_WRITE_TOKEN` will be automatically added when you create a Blob store

4. **Set up Blob Storage**

   - In your Vercel project dashboard, go to "Storage"
   - Create a new Blob store
   - The `BLOB_READ_WRITE_TOKEN` will be automatically added to your environment

5. **Initialize production database**

   ```bash
   npx prisma db push
   npm run db:seed
   ```

6. **Your app is live!**
   Visit your Vercel URL to see your deployed gallery

## Usage

### For Admins

1. **Login**: Visit `/admin/login` and enter the admin password
2. **Manage Categories**:
   - Go to "Categories" tab
   - Add new categories with custom names and colors
   - Delete categories as needed
3. **Upload Pictures**:
   - Go to "Pictures" tab
   - Drag and drop images or click to select
   - Assign categories to uploaded pictures
   - Delete pictures if needed

### For Public Users

1. **View Gallery**: Visit the homepage to see all pictures
2. **Filter by Category**:
   - Use the dropdown menu to filter pictures
   - Or click on the category tabs below
3. **Download Pictures**: Click the "Download" button to get all pictures in the current category as a zip file
4. **Category Indicators**: Pictures show their category as colored badges

## Project Structure

```
src/
├── app/
│   ├── admin/              # Admin panel pages
│   │   ├── categories/     # Category management
│   │   ├── login/          # Admin authentication
│   │   └── page.tsx        # Pictures management
│   ├── api/                # API routes
│   │   ├── categories/     # Category CRUD operations
│   │   ├── pictures/       # Picture CRUD operations
│   │   └── upload/         # File upload to Vercel Blob
│   └── page.tsx            # Public gallery page
├── lib/
│   └── data.ts             # Data management utilities
└── types/
    └── index.ts            # TypeScript interfaces
```

## API Endpoints

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `DELETE /api/categories/[id]` - Delete a category
- `GET /api/pictures` - Get all pictures
- `POST /api/pictures` - Add a new picture
- `PATCH /api/pictures/[id]` - Update picture category
- `DELETE /api/pictures/[id]` - Delete a picture
- `POST /api/upload` - Upload image to Vercel Blob

## Customization

### Changing the Admin Password

Edit `src/app/admin/login/page.tsx` and change the password in the `handleSubmit` function:

```typescript
if (password === "your-new-password") {
  // ...
}
```

### Styling

The app uses Tailwind CSS. You can customize colors, spacing, and layout by editing the classes in the component files.

### Default Categories

Edit `src/lib/data.ts` to change the default categories that are created on first run.

## Troubleshooting

### Vercel Deployment: Prisma Client Issues

If you encounter this error when deploying to Vercel:

```
PrismaClientInitializationError: Prisma has detected that this project was built on Vercel, which caches dependencies...
```

**Solution:** This has been fixed in the current setup with:

- `postinstall` script that runs `prisma generate` after npm install
- Updated build script: `prisma generate && next build`
- `.vercelignore` file to prevent caching of Prisma client

### Database Connection Issues

If you get database connection errors:

1. Verify your `DATABASE_URL` in Vercel environment variables
2. Ensure your Neon database is active and accessible
3. Check that your database has the required tables: `npx prisma db push`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
