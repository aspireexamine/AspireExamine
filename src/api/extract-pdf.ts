// This is a client-side API route handler for PDF extraction
// In a real implementation, this would be a server-side API endpoint

export async function extractPDFText(file: File): Promise<{ text: string }> {
  // For now, we'll use the existing Supabase function
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    // Use the existing Supabase function
    const response = await fetch('/api/supabase/functions/extract-pdf', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to extract PDF text');
    }
    
    return await response.json();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw error;
  }
}
