document.getElementById('uploadBtn').addEventListener('click', async () => {
  const fileInput = document.getElementById('galleryImage');
  const title = document.getElementById('imageTitle').value;
  const altText = document.getElementById('imageAltText').value;

  const statusDiv = document.getElementById('status');

  if (!fileInput.files.length || !title || !altText) {
    statusDiv.innerHTML = "<p class='error'>Please fill all fields and choose an image.</p>";
    return;
  }

  const file = fileInput.files[0];
  const fileName = `${Date.now()}_${file.name}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await window.supabase.storage
    .from('gallery')
    .upload(fileName, file);

  if (uploadError) {
    statusDiv.innerHTML = "<p class='error'>Upload failed. Try again.</p>";
    console.error(uploadError);
    return;
  }

  // Get Public URL using hardcoded format as getPublicUrl might be problematic
  const publicUrl = `https://jitlnpliyugbmgmlgexx.supabase.co/storage/v1/object/public/gallery/${fileName}`;

  // Insert metadata into gallery_images table
  const { data: insertData, error: insertError } = await window.supabase
    .from('gallery_images')
    .insert([
      { title: title, alt_text: altText, image_url: publicUrl }
    ]);

  if (insertError) {
    statusDiv.innerHTML = "<p class='error'>Database update failed.</p>";
    console.error(insertError);
    return;
  }

  statusDiv.innerHTML = "<p class='success'>Image uploaded successfully!</p>";
  fileInput.value = '';
  document.getElementById('imageTitle').value = '';
  document.getElementById('imageAltText').value = '';
  loadGallery(); // Reload gallery
});
