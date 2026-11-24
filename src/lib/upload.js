const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'doh4cvygr';
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'lolo-store';

export async function uploadImage(file) {
  if (!file.type?.startsWith('image/')) throw new Error('الملف مش صورة');
  if (file.size > 10 * 1024 * 1024) throw new Error('الصورة أكبر من 10MB');
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({}));
  if (!data.secure_url) throw new Error(data.error?.message || 'فشل رفع الصورة');
  return data.secure_url;
}

// يرفع عدة ملفات بالتوازي (3 في نفس الوقت) ويرجّع النتائج بنفس الترتيب
export async function uploadMany(files, onEach, concurrency = 3) {
  const results = new Array(files.length);
  let next = 0;
  const worker = async () => {
    while (next < files.length) {
      const i = next++;
      try { results[i] = { url: await uploadImage(files[i]) }; }
      catch (e) { results[i] = { error: e.message }; }
      onEach?.(i, results[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, worker));
  return results;
}
