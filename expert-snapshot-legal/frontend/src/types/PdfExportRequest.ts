import type { Request } from 'express';
import type { FormDataPayload } from './FormDataPayload';

export interface PdfExportRequest extends Request {
  body: {
    formData: FormDataPayload;
    filename: string;
  };
}

