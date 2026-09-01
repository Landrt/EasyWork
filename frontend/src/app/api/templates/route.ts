import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const templatesDir = path.join(process.cwd(), 'public', 'templates');
    
    // Check if directory exists
    if (!fs.existsSync(templatesDir)) {
      return NextResponse.json({ templates: [] });
    }

    const files = fs.readdirSync(templatesDir);
    
    // Filter for common image formats
    const templates = files
      .filter(file => /\.(png|jpe?g|webp|svg)$/i.test(file))
      .map(file => ({
        id: file,
        name: file.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
        url: `/templates/${file}`
      }));

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error reading templates directory:', error);
    return NextResponse.json({ error: 'Failed to load templates' }, { status: 500 });
  }
}
