import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
// file read, write,remove means file system 

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_COULD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });


const uploadOnCloudinary = async (localFilePath) => {
    // if (!localFilePath) return null;
    try {
        if(!localFilePath) return null;
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        // console.log("file is uploaded on cloudinary",response.url);

        // console.log("file is uploaded on cloudinary",response); // should study response data
        fs.unlink(localFilePath)
        return response
        

        
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null
    }
}

// https://res.cloudinary.com/<cloud_name>/image/upload/v1234567890/folder/filename.jpg

const deleteFromCloudinary = async(fileUrl) => {
    try {
        if(!fileUrl) return

        // extract everything after “…/upload/”
        const afterUpload = fileUrl.split("/upload/")[1]
        if(!afterUpload) return
            /* fileUrl = ".../upload/v1716987543/ profile/user123.jpg"
            afterUpload = "v1716987543/profile/user123.jpg" */

        // strip file extension
        const [publicIdWithVersion] = afterUpload.split(".")
            /* This removes the file extension. .jpg, .png, .webp */

        //drop leading “v123456789/” if present
        const publicId = publicIdWithVersion.replace(/^v\d+\//,"")

        await cloudinary.uploader.destroy(publicId)

    } catch (err) {
        console.error("Cloudinary delete failed:", err.message)
    }
}

export { uploadOnCloudinary, deleteFromCloudinary }






    /*
    // Upload an image
     const uploadResult = await cloudinary.uploader
       .upload(
           'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
               public_id: 'shoes',
           }
       )
       .catch((error) => {
           console.log(error);
       });
    */ 
