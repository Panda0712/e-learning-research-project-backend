export interface CreateResource {
  publicId: string;
  fileSize?: number;
  fileType?: string;
  fileUrl: string;
}

export interface UpdateResource {
  publicId?: string;
  fileSize?: number;
  fileType?: string;
  fileUrl?: string;
}
