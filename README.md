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
- **Storage**: Vercel Blob for images, JSON files for metadata
- **Icons**: Lucide React
- **File Processing**: JSZip for creating zip archives, file-saver for downloads
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Vercel account (for deployment and blob storage)

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
   
   For local development, you'll need to get a Blob token from Vercel:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard/stores)
   - Create a new Blob store or use an existing one
   - Copy the `BLOB_READ_WRITE_TOKEN` and add it to your `.env.local`

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
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

3. **Set up Blob Storage**
   - In your Vercel project dashboard, go to "Storage"
   - Create a new Blob store
   - The `BLOB_READ_WRITE_TOKEN` will be automatically added to your environment

4. **Your app is live!**
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
if (password === 'your-new-password') {
  // ...
}
```

### Styling

The app uses Tailwind CSS. You can customize colors, spacing, and layout by editing the classes in the component files.

### Default Categories

Edit `src/lib/data.ts` to change the default categories that are created on first run.

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
