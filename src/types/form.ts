// Form related types
export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  help?: string;
  children: React.ReactNode;
  className?: string;
}

export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface AlbumFormData {
  title: string;
  images: Array<{
    id: string;
    url: string;
    description?: string;
    file?: File;
    isNew?: boolean;
  }>;
  layout: import("./album").AlbumLayout;
  matConfig: import("./album").MatConfig;
  cycleDuration: number;
  coverUrl?: string;
}

export interface AlbumFormProps {
  mode: "create" | "edit";
  initialData?: Partial<AlbumFormData>;
  onSave: (data: AlbumFormData) => Promise<void>;
  loading?: boolean;
  className?: string;
}
