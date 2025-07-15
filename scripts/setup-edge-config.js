#!/usr/bin/env node

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

/**
 * Script to initialize Vercel Edge Config with default data
 * Run this script after setting up your Edge Config store
 */

const defaultData = {
  categories: [
    {
      id: 'arabic-proverbs',
      name: 'Arabic Proverbs',
      color: '#10b981',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'artworks-done-especially-for-my-kids',
      name: 'Artworks Done Especially For My Kids',
      color: '#ef4444',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'combination-design-and-colour',
      name: 'Combination Design and Colour',
      color: '#8b5cf6',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'english-proverbs',
      name: 'English Proverbs',
      color: '#3b82f6',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'khaldoon-unique-freehand-writing',
      name: 'Khaldoon Unique Freehand Writing',
      color: '#f97316',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'modern-painting',
      name: 'Modern Painting',
      color: '#06b6d4',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'personal-names',
      name: 'Personal Names',
      color: '#ec4899',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sign-label',
      name: 'Sign Label',
      color: '#eab308',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'still-life',
      name: 'Still Life',
      color: '#84cc16',
      createdAt: new Date().toISOString(),
    },
    {
      id: 't-shirt',
      name: 'T Shirt',
      color: '#a855f7',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ultra-modern-aya',
      name: 'Ultra Modern Aya',
      color: '#6366f1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ultra-modern-duaa',
      name: 'Ultra Modern Duaa',
      color: '#14b8a6',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ultra-modern-hadith',
      name: 'Ultra Modern Hadith',
      color: '#22c55e',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ultra-modern-style',
      name: 'Ultra Modern Style',
      color: '#f59e0b',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'with-oriental-taste',
      name: 'With Oriental Taste',
      color: '#f43f5e',
      createdAt: new Date().toISOString(),
    },
  ],
  pictures: [],
  lastUpdated: new Date().toISOString(),
};

async function setupEdgeConfig() {
  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelToken = process.env.VERCEL_TOKEN;

  if (!edgeConfigId || !vercelToken) {
    console.error('❌ EDGE_CONFIG_ID and VERCEL_TOKEN environment variables must be set');
    console.log('💡 Get your Edge Config ID from: https://vercel.com/dashboard/stores');
    console.log('💡 Get your Vercel token from: https://vercel.com/account/tokens');
    process.exit(1);
  }

  try {
    console.log('🚀 Initializing Edge Config with default data...');
    
    const response = await fetch(`https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            operation: 'upsert',
            key: 'appData',
            value: defaultData,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Edge Config update failed: ${response.status} ${errorText}`);
    }

    console.log('✅ Edge Config initialized successfully!');
    console.log(`📊 Created ${defaultData.categories.length} default categories`);
    console.log('⏱️  It may take a few minutes for changes to propagate globally');
    
  } catch (error) {
    console.error('❌ Failed to initialize Edge Config:', error.message);
    process.exit(1);
  }
}

setupEdgeConfig(); 