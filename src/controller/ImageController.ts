import { NextFunction, Request, Response } from "express"
var createError = require('http-errors');
import { AppDataSource } from "../data-source";
import { Images } from "../entity/Images";
import multer = require('multer');
import { v4 as uuidv4 } from 'uuid';
import { ImageGroups } from "../entity/ImageGroups";

export class ImageController {

  private imageRepository = AppDataSource.getRepository(Images)
  private imageGroupRepository = AppDataSource.getRepository(ImageGroups)

  async get_images_from_group_id(request: Request, response: Response, next: NextFunction) {
    let { image_group_id } = request.params;

    // Check if image group exists

    const image_group = await this.imageGroupRepository.findOne({
      where: { id: parseInt(image_group_id) }
    })

    if (!image_group) return next(createError(401, "An image group couldn't be found that has the given image_group_id")); // An image group does not exist with this id

    const images: Images[] = await this.imageRepository.createQueryBuilder("images").where("images.image_group = :image_group_id", { image_group_id: parseInt(image_group_id) }).getMany()

    return images
  }

  async upload_image(request: Request, response: Response, next: NextFunction) {
    let { image_group_id } = request.params;
    const self = this;

    // Check if the user owns this image group
    const image_group = await this.imageGroupRepository.findOne({
      where: { id: parseInt(image_group_id) },
      relations: ["user"]
    })

    if (!image_group) return next(createError(401, "An image group couldn't be found that has the given image_group_id")); // An image group does not exist with this id
    if (image_group.user.id != request.user_data.id) return next(createError(401, "You do not have permission to upload an image to this image group")); // The user does not own this image group

    const uploadResult = await new Promise((resolve, reject) => {
      upload(request, response, async function (err: any) {
        console.log("File debug: ", request.file)
        if (request.file) { // File validation has to be done here because the file is not available in the validation middleware
          if (!(["image/png", "image/jpeg", "image/gif"].includes(request.file.mimetype))) {
            return reject(next(createError(401, "This file type is not supported (allowed: png, jpeg, gif)")));
          }
        } else {
          console.log("No file was uploaded")
          console.log("request dump: ", request)
          return reject(next(createError(401, "No image was uploaded")));
        }

        if (err instanceof multer.MulterError) {
          return reject(next(createError(401, "An error occoured whilst uploading the image")));
        } else if (err) {
          return reject(next(createError(401, "An error occoured whilst uploading the image")));
        }

        const file_name = request.file.filename.split('.')
        const image: Images = Object.assign(new Images(), {
          image_group: parseInt(image_group_id),
          image_uuid: file_name[0],
          image_file_type: file_name[1]
        })

        const image_saved: Images = await self.imageRepository.save(image);

        if (!image_saved) return reject(next(createError(401, "This image couldn't be uploaded"))); // image couldn't be uploaded

        return resolve({ message: "The image has been uploaded successfully", image: image_saved });

      })
    })

    return uploadResult

  }

}

const storage = multer.diskStorage({
  destination: function (req: Request, file: any, cb: FileNameCallback) {
    cb(null, 'images/')
  },
  filename: function (req: Request, file: any, cb: FileNameCallback) {
    const uuid = uuidv4();
    const fileExtension = file.originalname.split('.').pop();
    cb(null, uuid + '.' + fileExtension)
  }
})

const upload = multer({ storage: storage }).single('image')