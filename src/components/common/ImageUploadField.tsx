import { useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Box,
  Button,
  CircularProgress,
  FormHelperText,
  IconButton,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ClearIcon from '@mui/icons-material/Clear';
import { uploadImage } from '@/api/upload';

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface ImageUploadFieldProps {
  name: string;
  label: string;
  required?: boolean;
  helpText?: string;
  uploadFolder?: string;
  disabled?: boolean;
}

export function ImageUploadField({
  name,
  label,
  required,
  helpText,
  uploadFolder = 'profiles',
  disabled,
}: ImageUploadFieldProps) {
  const { control } = useFormContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const currentUrl = field.value as string | undefined;
        const previewSrc = localPreview ?? currentUrl ?? '';

        async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
          const file = e.target.files?.[0];
          if (!file) return;

          if (file.size > MAX_SIZE_BYTES) {
            setUploadError('File must be under 5 MB.');
            return;
          }

          const blob = URL.createObjectURL(file);
          setLocalPreview(blob);
          setUploading(true);
          setUploadError(null);

          try {
            const fileUrl = await uploadImage(file, uploadFolder);
            field.onChange(fileUrl);
            setLocalPreview(null);
          } catch {
            setUploadError('Upload failed. Please try again.');
            setLocalPreview(null);
          } finally {
            setUploading(false);
            URL.revokeObjectURL(blob);
            // reset so same file can be re-selected after an error
            if (inputRef.current) inputRef.current.value = '';
          }
        }

        function handleRemove() {
          field.onChange('');
          setLocalPreview(null);
          setUploadError(null);
        }

        const errorMessage = uploadError ?? fieldState.error?.message;

        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {label}
              {required && (
                <Typography component="span" color="error" sx={{ ml: 0.25 }}>
                  *
                </Typography>
              )}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              {/* Preview thumbnail */}
              {previewSrc && (
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                  <Box
                    component="img"
                    src={previewSrc}
                    alt={label}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      opacity: uploading ? 0.5 : 1,
                      display: 'block',
                    }}
                  />
                  {uploading && (
                    <CircularProgress
                      size={24}
                      sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }}
                    />
                  )}
                  {!uploading && (
                    <IconButton
                      size="small"
                      aria-label={`Remove ${label}`}
                      onClick={handleRemove}
                      disabled={disabled}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        p: 0.25,
                        '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' },
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              )}

              {/* Upload button */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED_TYPES}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  aria-label={`Upload ${label}`}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <UploadFileIcon />}
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading || disabled}
                >
                  {uploading ? 'Uploading…' : previewSrc ? 'Change' : 'Upload Image'}
                </Button>
                <Typography variant="caption" color="text.secondary">
                  JPEG, PNG, WebP · max 5 MB
                </Typography>
              </Box>
            </Box>

            {(errorMessage || helpText) && (
              <FormHelperText error={!!errorMessage} sx={{ mt: 0.5 }}>
                {errorMessage ?? helpText}
              </FormHelperText>
            )}
          </Box>
        );
      }}
    />
  );
}
