import { useEffect, useRef, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { FormRenderer } from '@/components/common/FormRenderer';
import { WorkingHoursSection } from './WorkingHoursSection';
import { PROFILE_FIELDS } from '@/config/formFields';
import { useCategories, useSubCategories } from '@/api/categories';
import type { ProfileFormValues } from '@/schemas/profile.schema';

const PROFILE_TYPE_OPTIONS = [
  { value: 'PROFESSIONAL_CONSULTANT', label: 'Professional Consultant' },
  { value: 'SERVICE_BRANDS', label: 'Service Brands' },
  { value: 'PRODUCT_BRANDS', label: 'Product Brands' },
  { value: 'RETAIL_BRANDS', label: 'Retail Brands' },
];

interface ProfileFormProps {
  mode: 'create' | 'edit';
}

export function ProfileForm({ mode }: ProfileFormProps) {
  const { setValue } = useFormContext<ProfileFormValues>();
  const { data: categories } = useCategories();

  const categoryId = useWatch<ProfileFormValues, 'categoryId'>({ name: 'categoryId' });
  const prevCategoryRef = useRef('');
  const { data: subcategories } = useSubCategories(categoryId ?? '');

  const [profileType, setProfileType] = useState('');

  const allCategories = categories ?? [];
  const selectedCategory = allCategories.find((c) => c.id === categoryId);

  // Reset local UI state when form resets to a different profile (cross-profile navigation)

  // On edit: sync profile type whenever the loaded category changes (handles cross-profile navigation)
  useEffect(() => {
    if (selectedCategory?.type && selectedCategory.type !== profileType) {
      setProfileType(selectedCategory.type);
      prevCategoryRef.current = ''; // treat the incoming categoryId as a fresh load, not a user switch
    }
  }, [selectedCategory, profileType]);

  // Clear subCategoryId whenever categoryId changes, except on the very first render
  // and except when the form is externally reset (reset() sets both at once so subcategory is preserved by reset itself)
  useEffect(() => {
    const prev = prevCategoryRef.current;
    prevCategoryRef.current = categoryId ?? '';
    // skip initial mount (prev empty → empty) and skip when value didn't change
    if (prev === (categoryId ?? '')) return;
    // skip when transitioning from '' to a real value — that's a reset() or initial selection, not a user switch
    if (!prev) return;
    setValue('subCategoryId', '', { shouldDirty: false });
  }, [categoryId, setValue]);

  const handleProfileTypeChange = (newType: string) => {
    setProfileType(newType);
    // Erase category + subcategory when profile type changes
    setValue('categoryId', '', { shouldDirty: true });
    setValue('subCategoryId', '', { shouldDirty: false });
    // Do NOT reset prevCategoryRef here — let the categoryId useEffect handle it
    // so the next user-driven category selection ('' → newId) still clears subcategory correctly
  };

  // Always include the currently-selected category so the Select never shows blank
  // (covers the brief window while profileType transitions after cross-profile navigation)
  const filteredCategories = (() => {
    if (!profileType) {
      return categoryId ? allCategories.filter((c) => c.id === categoryId) : [];
    }
    const byType = allCategories.filter((c) => c.type === profileType);
    if (categoryId && !byType.some((c) => c.id === categoryId)) {
      const current = allCategories.find((c) => c.id === categoryId);
      if (current) return [...byType, current];
    }
    return byType;
  })();

  const categoryOptions = filteredCategories.map((c) => ({ label: c.name, value: c.id }));
  const subcategoryOptions = (subcategories ?? []).map((s) => ({ label: s.name, value: s.id }));

  // exclude categoryId, subCategoryId (rendered directly below), and workingHours
  const rendererFields = PROFILE_FIELDS.filter(
    (f) => f.name !== 'categoryId' && f.name !== 'subCategoryId' && f.name !== 'workingHours',
  );

  // Adjust which fields show and their labels depending on profile type
  const dynamicRendererFields = rendererFields
    // filter out professional-only fields when not a professional consultant
    .filter((f) => {
      if (profileType !== 'PROFESSIONAL_CONSULTANT') {
        return !['professionalTitle', 'qualifications', 'specializations', 'services'].includes(f.name);
      }
      return true;
    })
    .map((f) => {
      // top-level name label differs between professional vs brand
      if (f.name === 'name') {
        return {
          ...f,
          label:
            profileType === 'PROFESSIONAL_CONSULTANT'
              ? 'NAME of the CONSULTANT / CONSULTATION FIRM'
              : 'NAME of the SERVICE BRAND / RETAIL BRAND / PRODUCT BRAND',
        };
      }

      // year label already dynamic — keep same logic
      if (f.name === 'yearOfEstablishment') {
        return {
          ...f,
          label:
            profileType === 'PROFESSIONAL_CONSULTANT'
              ? 'Year of Starting Practice'
              : 'Year of Establishment',
        };
      }

      // adjust nested section fields (contact) labels
      if (f.type === 'section' && f.name === 'contact') {
        const nested = (f.fields ?? []).map((sub) => {
          if (sub.name === 'contact.contactPersonName') {
            return { ...sub, label: 'Name of the Profile Creator' };
          }
          return sub;
        });
        return { ...f, fields: nested };
      }

      return f;
    });

  const showSubCategory = !!selectedCategory?.isSubCategoryNeeded;
  const { control } = useFormContext<ProfileFormValues>();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Profile Type — UI-only; not persisted */}
      <FormControl fullWidth>
        <InputLabel>Profile Type</InputLabel>
        <Select
          value={profileType}
          label="Profile Type"
          onChange={(e) => handleProfileTypeChange(e.target.value)}
        >
          <MenuItem value=""><em>Select profile type…</em></MenuItem>
          {PROFILE_TYPE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
        <FormHelperText>Filters the category list. Not stored as a separate field.</FormHelperText>
      </FormControl>

      {/* Category — direct Controller to avoid disabled/options timing issues */}
      <Controller
        name="categoryId"
        control={control}
        render={({ field, fieldState }) => (
          <FormControl fullWidth required error={!!fieldState.error} disabled={!profileType}>
            <InputLabel>Category</InputLabel>
            <Select {...field} label="Category" value={field.value ?? ''}>
              <MenuItem value=""><em>Select Category</em></MenuItem>
              {categoryOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
            {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
          </FormControl>
        )}
      />

      {/* Sub-Category — shown only when category requires it */}
      {showSubCategory && (
        <Controller
          name="subCategoryId"
          control={control}
          render={({ field, fieldState }) => (
            <FormControl fullWidth required error={!!fieldState.error} disabled={!categoryId}>
              <InputLabel>Sub-Category</InputLabel>
              <Select {...field} label="Sub-Category" value={field.value ?? ''}>
                <MenuItem value=""><em>Select Sub-Category</em></MenuItem>
                {subcategoryOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
              {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              <FormHelperText>Required when the selected category uses sub-categories</FormHelperText>
            </FormControl>
          )}
        />
      )}

      <FormRenderer fields={dynamicRendererFields} mode={mode} />
      <WorkingHoursSection />
    </Box>
  );
}

export default ProfileForm;
