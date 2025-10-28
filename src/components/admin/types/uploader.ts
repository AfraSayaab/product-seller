
export type UploadItem = {
  key: string;        // S3 key
  url: string;        // public URL
  name: string;       // original filename
  size: number;       // in bytes
  type: string;       // mime type
};

export type UploaderMode = "single" | "multiple";

export interface UploaderProps {
  mode?: UploaderMode; // default: 'single'
  accept?: string[]; // e.g. ['image/*', 'application/pdf']
  maxFiles?: number; // only for multiple
  maxSizeMB?: number; // client-side check mirrors server max
  folder?: string; // where to store in S3
  disabled?: boolean;
  defaultValue?: UploadItem | UploadItem[] | null;
  label?: string;
  helperText?: string;
  className?: string;
  // parent receives either a single UploadItem | null OR UploadItem[]
  onChange?: (value: UploadItem | UploadItem[] | null) => void;
}
