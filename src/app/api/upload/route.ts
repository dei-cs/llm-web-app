import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'text/plain',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const collectionName = formData.get('collection_name') as string || 'documents';

    if (!files || files.length === 0) {
      return new Response('No files provided', { status: 400 });
    }

    // Validate files
    for (const file of files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return new Response(
          `File "${file.name}" exceeds maximum size of 10MB`,
          { status: 400 }
        );
      }

      // Check file type
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return new Response(
          `File "${file.name}" has an unsupported format. Only PDF, DOCX, and TXT files are allowed.`,
          { status: 400 }
        );
      }
    }

    // Prepare FormData for backend
    const backendFormData = new FormData();
    for (const file of files) {
      backendFormData.append('files', file);
    }
    
    // Add form fields expected by the backend
    backendFormData.append('collection_name', collectionName);
    backendFormData.append('user_id', 'test-user');

    // Send to backend
    const apiKey = process.env.BACKEND_API_KEY;
    const baseUrl = process.env.BACKEND_API_URL;

    const response = await fetch(`${baseUrl}/v1/upload-docs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Backend upload failed');
      return new Response(errorText, { status: response.status || 500 });
    }

    const result = await response.json();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully uploaded ${files.length} file(s)`,
        files: files.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
        result,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Upload error:', error);
    return new Response(
      error?.message || 'An error occurred during upload',
      { status: 500 }
    );
  }
}
