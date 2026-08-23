/**
 * ETERNAL NUTRICARE — CLOUDINARY DIRECT UPLOAD ADAPTER
 * High-Performance Image Upload Pipeline with Automatic Compression (f_auto, q_auto)
 */

window.CloudinaryUpload = (function() {

  const config = window.STORE_CONFIG || {};

  async function uploadImageFile(file, onProgress) {
    // If Cloudinary credentials are configured
    if (config.cloudinaryCloudName && config.cloudinaryUploadPreset) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', config.cloudinaryUploadPreset);
      formData.append('folder', 'eternal_nutricare_products');

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        if (data.secure_url) {
          // Return optimized URL
          const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_1000/');
          return { success: true, url: optimizedUrl };
        } else {
          throw new Error(data.error?.message || 'Cloudinary upload failed');
        }
      } catch (err) {
        console.warn('Cloudinary upload error:', err.message);
        throw err;
      }
    }

    // Local / Preview fallback when keys are not yet pasted:
    // Read local file as ObjectURL / DataURL for instant UI preview
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({ success: true, url: e.target.result, localPreview: true });
      };
      reader.readAsDataURL(file);
    });
  }

  return {
    uploadImageFile
  };

})();
