import { useState } from 'react';
import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputAdornment,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Controller, useFormContext } from 'react-hook-form';
import dayjs from 'dayjs';
import type { FormFieldDefinition } from '@/api/types';
import { ImageUploadField } from './ImageUploadField';

interface FormRendererProps {
  fields: FormFieldDefinition[];
  /** 'create' | 'edit' — controls field visibility */
  mode?: 'create' | 'edit';
  /** externally provided options for dynamic sources */
  dynamicOptions?: Record<string, Array<{ label: string; value: string }>>;
}

export function FormRenderer({ fields, mode = 'create', dynamicOptions = {} }: FormRendererProps) {
  const { control, formState: { errors } } = useFormContext();

  const visibleFields = fields.filter((f) => {
    if (mode === 'create' && f.create === false) return false;
    if (mode === 'edit' && f.edit === false) return false;
    return true;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {visibleFields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          mode={mode}
          errors={errors}
          control={control}
          dynamicOptions={dynamicOptions}
        />
      ))}
    </Box>
  );
}

// ─── Individual field renderer ────────────────────────────────────────────────

interface FieldRendererProps {
  field: FormFieldDefinition;
  mode: 'create' | 'edit';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  dynamicOptions: Record<string, Array<{ label: string; value: string }>>;
}

function FieldRenderer({ field, mode, errors, control, dynamicOptions }: FieldRendererProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Nested section
  if (field.type === 'section') {
    const sectionFields = (field.fields ?? []).filter((f) => {
      if (mode === 'create' && f.create === false) return false;
      if (mode === 'edit' && f.edit === false) return false;
      return true;
    });
    return (
      <Box>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
          {field.label}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
          {sectionFields.map((sub) => (
            <FieldRenderer
              key={sub.name}
              field={sub}
              mode={mode}
              errors={getNestedErrors(errors, sub.name)}
              control={control}
              dynamicOptions={dynamicOptions}
            />
          ))}
        </Box>
      </Box>
    );
  }

  const fieldError = getNestedError(errors, field.name);
  const options = field.options ?? (field.source ? (dynamicOptions[field.source] ?? []) : []);
  const isReadOnly = field.readOnly || (mode === 'edit' && field.edit === false);

  // Boolean / Switch
  if (field.type === 'boolean') {
    return (
      <Controller
        name={field.name}
        control={control}
        render={({ field: f }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(f.value)}
                onChange={(e) => f.onChange(e.target.checked)}
                disabled={isReadOnly}
              />
            }
            label={field.label}
          />
        )}
      />
    );
  }

  // Select
  if (field.type === 'select') {
    return (
      <Controller
        name={field.name}
        control={control}
        render={({ field: f }) => (
          <TextField
            {...f}
            select
            label={field.label}
            required={field.required}
            error={!!fieldError}
            helperText={fieldError?.message ?? field.helpText}
            disabled={isReadOnly}
            fullWidth
            inputProps={{ 'aria-label': field.label }}
          >
            <MenuItem value="">
              <em>Select {field.label}</em>
            </MenuItem>
            {options.map((opt) => (
              <MenuItem key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
    );
  }

  // MultiSelect
  if (field.type === 'multiSelect') {
    return (
      <Controller
        name={field.name}
        control={control}
        render={({ field: f }) => (
          <Autocomplete
            multiple
            options={options}
            getOptionLabel={(o) => o.label}
            value={options.filter((o) => (f.value as string[] ?? []).includes(String(o.value)))}
            onChange={(_, newVal) => f.onChange(newVal.map((v) => String(v.value)))}
            disabled={isReadOnly}
            renderTags={(val, getTagProps) =>
              val.map((opt, idx) => (
                <Chip key={String(opt.value)} label={opt.label} size="small" {...getTagProps({ index: idx })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={field.label}
                required={field.required}
                error={!!fieldError}
                helperText={fieldError?.message ?? field.helpText}
              />
            )}
          />
        )}
      />
    );
  }

  // Radio
  if (field.type === 'radio') {
    return (
      <Controller
        name={field.name}
        control={control}
        render={({ field: f }) => (
          <FormControl error={!!fieldError} disabled={isReadOnly}>
            <FormLabel required={field.required}>{field.label}</FormLabel>
            <RadioGroup {...f} row>
              {options.map((opt) => (
                <FormControlLabel
                  key={String(opt.value)}
                  value={String(opt.value)}
                  control={<Radio />}
                  label={opt.label}
                />
              ))}
            </RadioGroup>
            {(fieldError || field.helpText) && (
              <FormHelperText>{fieldError?.message ?? field.helpText}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    );
  }

  // Date
  if (field.type === 'date') {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Controller
          name={field.name}
          control={control}
          render={({ field: f }) => (
            <DatePicker
              label={field.label}
              value={f.value ? dayjs(f.value as string) : null}
              onChange={(date) => f.onChange(date?.toISOString() ?? '')}
              disabled={isReadOnly}
              slotProps={{
                textField: {
                  required: field.required,
                  error: !!fieldError,
                  helperText: fieldError?.message ?? field.helpText,
                  fullWidth: true,
                },
              }}
            />
          )}
        />
      </LocalizationProvider>
    );
  }

  // Image upload
  if (field.type === 'imageUpload') {
    return (
      <ImageUploadField
        name={field.name}
        label={field.label}
        required={field.required}
        helpText={field.helpText}
        uploadFolder={field.uploadFolder}
        disabled={isReadOnly}
      />
    );
  }

  // Password
  if (field.type === 'password') {
    return (
      <Controller
        name={field.name}
        control={control}
        render={({ field: f }) => (
          <TextField
            {...f}
            label={field.label}
            type={showPassword ? 'text' : 'password'}
            required={field.required}
            error={!!fieldError}
            helperText={fieldError?.message ?? field.helpText}
            disabled={isReadOnly}
            fullWidth
            autoComplete="new-password"
            inputProps={{ minLength: field.minLength, maxLength: field.maxLength }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      />
    );
  }

  // text, email, textarea, number (default)
  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: f }) => (
        <TextField
          {...f}
          label={field.label}
          type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
          multiline={field.type === 'textarea'}
          rows={field.type === 'textarea' ? 3 : undefined}
          required={field.required}
          error={!!fieldError}
          helperText={fieldError?.message ?? field.helpText}
          disabled={isReadOnly}
          fullWidth
          inputProps={{
            minLength: field.minLength,
            maxLength: field.maxLength,
            min: field.min,
            max: field.max,
            'aria-label': field.label,
          }}
        />
      )}
    />
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedError(errors: Record<string, any>, path: string) {
  return path.split('.').reduce((acc, key) => acc?.[key], errors);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedErrors(errors: Record<string, any>, path: string): Record<string, any> {
  const parts = path.split('.');
  const parent = parts.slice(0, -1).join('.');
  return parent ? (getNestedError(errors, parent) ?? {}) : errors;
}

export default FormRenderer;
