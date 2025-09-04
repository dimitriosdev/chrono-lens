// Type declarations for heic2any library
declare module "heic2any" {
  interface ConversionOptions {
    blob: Blob | File;
    toType?: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
    quality?: number;
    multiple?: boolean;
  }

  function heic2any(options: ConversionOptions): Promise<Blob | Blob[]>;
  export default heic2any;
}
