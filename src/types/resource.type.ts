export interface CreateResource {
  publicId: string;
  fileSize?: number | null;
  fileType?: string | null;
  fileUrl: string;
}

export interface UpdateResource {
  publicId?: string;
  fileSize?: number;
  fileType?: string;
  fileUrl?: string;
}
