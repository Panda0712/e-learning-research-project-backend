import cloudinary from "cloudinary";
export declare const CloudinaryProvider: {
    uploadImage: (buffer: Buffer) => Promise<unknown>;
    uploadDoc: (buffer: Buffer) => Promise<unknown>;
    uploadVideo: (buffer: Buffer) => Promise<unknown>;
    uploadVideoLarge: (filePath: string) => Promise<cloudinary.UploadApiResponse> | cloudinary.UploadStream;
};
//# sourceMappingURL=CloudinaryProvider.d.ts.map