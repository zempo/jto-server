const Treeize = require("treeize");
const { isWebUri } = require("valid-url");

const cloudinary = require("cloudinary");
const { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = require("../config");

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

const CloudService = {
  validateSize(filesToUpload) {
    const NO_ERRORS = null;
    const { front, inside } = filesToUpload;

    if (front && front.size / 1024 / 1024 > 0.5) {
      return { error: "front image too large" };
    }
    if (inside && inside.size / 1024 / 1024 > 0.5) {
      return { error: "inside image too large" };
    }

    return NO_ERRORS;
  },
  async uploadFront(fileToUpload) {
    let FILES = [];
    const cloudRes = await cloudinary.v2.uploader.upload(fileToUpload.front.path, {
      moderation: "aws_rek"
    });
    if (cloudRes.moderation[0].status === "rejected") {
      FILES.push("NSFW content added");
    }

    FILES.push(cloudRes.url);
    // console.log(FILES, "front, only");
    return FILES;
  },
  async uploadInside(fileToUpload) {
    let FILES = [];

    let cloudRes = await cloudinary.v2.uploader.upload(fileToUpload.inside.path, {
      moderation: "aws_rek"
    });
    if (cloudRes.moderation[0].status === "rejected") {
      FILES.push("NSFW content added");
    }

    FILES.push(cloudRes.url);
    // console.log(FILES, "inside, only");
    return FILES;
  },
  async uploadBoth(filesToUpload) {
    let FILES = [];
    let cloudRes1 = await cloudinary.v2.uploader.upload(filesToUpload.front.path, {
      moderation: "aws_rek"
    });

    if (cloudRes1.moderation[0].status === "rejected") {
      FILES.push("NSFW content added");
    }

    FILES.push(cloudRes1.url);

    let cloudRes2 = await cloudinary.v2.uploader.upload(filesToUpload.inside.path, {
      moderation: "aws_rek"
    });

    if (cloudRes2.moderation[0].status === "rejected") {
      FILES.push("NSFW content added");
    }

    FILES.push(cloudRes2.url);
    // console.log(FILES, "both");
    return FILES;
  },
  uploadByFilePath(filesToUpload) {
    // conditionally run the previously named functions
    if (filesToUpload.front && !filesToUpload.inside) {
      return CloudService.uploadFront(filesToUpload);
    } else if (!filesToUpload.front && filesToUpload.inside) {
      return CloudService.uploadInside(filesToUpload);
    } else if (filesToUpload.front && filesToUpload.inside) {
      return CloudService.uploadBoth(filesToUpload);
    } else {
      return [];
    }
  }
};

module.exports = CloudService;
