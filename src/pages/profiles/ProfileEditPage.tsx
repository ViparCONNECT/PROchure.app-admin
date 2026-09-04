import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, CircularProgress, Typography, FormControlLabel, Switch, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import { profileSchema, type ProfileFormValues } from '@/schemas/profile.schema';
import { useProfile, useUpdateProfile } from '@/api/profiles';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { UnsavedChangesGuard } from '@/components/common/UnsavedChangesGuard';
import { PageError } from '@/components/common/ErrorDisplay';
import { parseApiError } from '@/utils/api-error';
import type { Profile } from '@/api/types';

function profileToFormValues(profile: Profile): ProfileFormValues {
  return {
    isDisabled: profile.isDisabled,
    isWomenEntrepreneur: profile.isWomenEntrepreneur ?? false,
    image: profile.image ?? '',
    logo: profile.logo ?? '',
    categoryId: profile.categoryId ?? profile.category?.id ?? '',
    subCategoryId: profile.subCategoryId ?? profile.sub_category?.id ?? '',
    name: profile.name,
    professionalTitle: profile.professionalTitle ?? '',
    qualifications: profile.qualifications ?? '',
    yearOfEstablishment: profile.yearOfEstablishment ?? '',
    yearOfPractice: profile.yearOfPractice ?? '',
    specializations: profile.specializations ?? '',
    services: profile.services ?? '',
    address: {
      buildingMallPropertyName: profile.address.buildingMallPropertyName ?? '',
      doorShopNo: profile.address.doorShopNo ?? '',
      floor: profile.address.floor ?? '',
      streetLaneRoadNameSubLocality: profile.address.streetLaneRoadNameSubLocality ?? '',
      nearestLandmark: profile.address.nearestLandmark ?? '',
      secondaryPrimaryLocality: profile.address.secondaryPrimaryLocality ?? '',
      cityTown: profile.address.cityTown,
      stateProvince: profile.address.stateProvince,
      country: profile.address.country,
      pinCodeZipCode: profile.address.pinCodeZipCode ?? '',
    },
    contact: {
      countryCode: profile.contact.countryCode ?? '',
      officialContactNumber: profile.contact.officialContactNumber ?? '',
      officialEmailId: profile.contact.officialEmailId ?? '',
      officialWebsiteApp: profile.contact.officialWebsiteApp ?? '',
      contactPersonName: profile.contact.contactPersonName ?? '',
      contactPersonDesignation: profile.contact.contactPersonDesignation ?? '',
      mostComfortablePreferredLanguages:
        profile.contact.mostComfortablePreferredLanguages ?? [],
    },
    workingHours: {
      monday: profile.workingHours?.monday ?? '',
      tuesday: profile.workingHours?.tuesday ?? '',
      wednesday: profile.workingHours?.wednesday ?? '',
      thursday: profile.workingHours?.thursday ?? '',
      friday: profile.workingHours?.friday ?? '',
      saturday: profile.workingHours?.saturday ?? '',
      sunday: profile.workingHours?.sunday ?? '',
    },
  };
}

export function ProfileEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const updateProfile = useUpdateProfile();

  const { data: profile, isLoading, error, refetch } = useProfile(id!);

  const methods = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
    setError,
    setValue,
    watch,
  } = methods;

  const isDisabled = watch('isDisabled');
  const isWomen = watch('isWomenEntrepreneur');

  useEffect(() => {
    if (profile) {
      reset(profileToFormValues(profile));
    }
  }, [profile, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    const dto = {
      ...values,
      professionalTitle: values.professionalTitle || undefined,
      qualifications: values.qualifications || undefined,
      image: values.image || undefined,
      logo: values.logo || undefined,
      subCategoryId: values.subCategoryId || undefined,
      specializations: values.specializations || undefined,
      services: values.services || undefined,
      address: { ...values.address, pinCodeZipCode: values.address.pinCodeZipCode ?? '' },
      contact: values.contact
        ? {
          countryCode: values.contact.countryCode ?? '',
          officialContactNumber: values.contact.officialContactNumber ?? '',
          officialEmailId: values.contact.officialEmailId ?? '',
          officialWebsiteApp: values.contact.officialWebsiteApp ?? '',
          contactPersonName: values.contact.contactPersonName ?? '',
          contactPersonDesignation: values.contact.contactPersonDesignation ?? '',
          mostComfortablePreferredLanguages: values.contact.mostComfortablePreferredLanguages ?? [],
        }
        : { countryCode: '', officialContactNumber: '', officialEmailId: '', officialWebsiteApp: '', contactPersonName: '', contactPersonDesignation: '', mostComfortablePreferredLanguages: [] },
    };

    try {
      await updateProfile.mutateAsync({ id: id!, dto });
      enqueueSnackbar('Profile updated.', { variant: 'success' });
      navigate('/profiles');
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.fieldErrors) {
        Object.entries(parsed.fieldErrors).forEach(([field, msg]) => {
          setError(field as keyof ProfileFormValues, { message: msg });
        });
      } else {
        enqueueSnackbar(parsed.message, { variant: 'error' });
      }
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <PageError message={parseApiError(error).message} onRetry={refetch} />;
  }

  return (
    <Box maxWidth={800}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/profiles')} sx={{ mb: 2 }}>
        Back to Profiles
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h5" fontWeight={700}>
            Edit Profile — {profile?.name}
          </Typography>
          {isDisabled && <Chip label="Disable" color="default" size="small" />}
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={isDisabled ?? false}
                onChange={(e) => setValue('isDisabled', e.target.checked, { shouldDirty: true })}
                color="error"
              />
            }
            label="Disable"
            labelPlacement="start"
          />
          <FormControlLabel
            control={
              <Switch
                checked={isWomen ?? false}
                onChange={(e) => setValue('isWomenEntrepreneur', e.target.checked, { shouldDirty: true })}
              />
            }
            label="SHE-PRO"
            labelPlacement="start"
          />
        </Box>
      </Box>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <FormProvider {...methods}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <ProfileForm mode="edit" />
              <Box sx={{ display: 'flex', gap: 1, mt: 3, justifyContent: 'flex-end' }}>
                <Button onClick={() => navigate('/profiles')} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || !isDirty}
                >
                  {isSubmitting ? 'Saving…' : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          </FormProvider>
        </CardContent>
      </Card>

      <UnsavedChangesGuard isDirty={isDirty && !isSubmitting} />
    </Box>
  );
}

export default ProfileEditPage;
