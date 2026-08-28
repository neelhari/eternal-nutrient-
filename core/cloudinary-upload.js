/**
 * ETERNAL NUTRICARE — CLOUDINARY DIRECT UPLOAD ADAPTER
 * High-Performance Image Upload Pipeline with Automatic Pre-Upload Canvas Compression (<200KB)
 */

window.CloudinaryUpload = (function() {

  const config = window.STORE_CONFIG || {};

  async function uploadImageFile(file, onProgress) {
    if (!file) throw new Error('No file provided');

    // Step 1: Compress the image in-browser first (< 200KB)
    let uploadPayload = file;
    let fallbackBase64 = '';
    
    if (window.ImageUploader && typeof window.ImageUploader.compressImage === 'function') {
      try {
        const compressed = await window.ImageUploader.compressImage(file, 1200, 0.82);
        if (compressed && compressed.blob) {
          uploadPayload = compressed.blob;
          fallbackBase64 = compressed.base64;
        }
      } catch (cErr) {
        console.warn('In-browser compression skipped:', cErr);
      }
    }

    // Step 2: Upload to Cloudinary Unsigned Endpoint
    if (config.cloudinaryCloudName && config.cloudinaryUploadPreset) {
      const formData = new FormData();
      formData.append('file', uploadPayload);
      formData.append('upload_preset', config.cloudinaryUploadPreset);
      formData.append('folder', 'eternal_nutricare_products');

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        if (data.secure_url) {
          const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_1000/');
          return { success: true, url: optimizedUrl };
        } else {
          throw new Error(data.error?.message || 'Cloudinary upload failed');
        }
      } catch (err) {
        console.warn('Cloudinary upload fallback to compressed base64:', err.message);
        if (fallbackBase64) {
          return { success: true, url: fallbackBase64, localPreview: true };
        }
      }
    }

    // Local / Base64 fallback (compressed)
    if (fallbackBase64) {
      return { success: true, url: fallbackBase64, localPreview: true };
    }

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
