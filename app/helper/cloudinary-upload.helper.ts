import cloudinary from "./cloudinary.helper.ts";

export const uploadToCloudinary = (
  buffer: Buffer,
  folder = "primerch"
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) return reject(error);

        resolve({
          url: result!.secure_url,
          publicId: result!.public_id,
        });
      })
      .end(buffer);
  });
};
