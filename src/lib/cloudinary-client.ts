export async function deleteFromCloudinary(
  url: string,
  eventId?: string,
): Promise<void> {
  if (!url.includes('res.cloudinary.com')) return;
  try {
    await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, ...(eventId ? { eventId } : {}) }),
    });
  } catch {}
}
