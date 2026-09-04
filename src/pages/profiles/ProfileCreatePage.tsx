import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Chip, FormControlLabel, Switch, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import { profileSchema, type ProfileFormValues } from '@/schemas/profile.schema';
import { useCreateProfile } from '@/api/profiles';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { UnsavedChangesGuard } from '@/components/common/UnsavedChangesGuard';
import { parseApiError } from '@/utils/api-error';

const DEFAULT_VALUES: ProfileFormValues = {
  isDisabled: false,
  isWomenEntrepreneur: false,
  image: '',
  logo: '',
  categoryId: '',
  subCategoryId: '',
  name: '',
  professionalTitle: '',
  qualifications: '',
  yearOfEstablishment: '',
  specializations: '',
  yearOfPractice: '',
  services: '',
  address: {
    buildingMallPropertyName: '',
    doorShopNo: '',
    floor: '',
    streetLaneRoadNameSubLocality: '',
    nearestLandmark: '',
    secondaryPrimaryLocality: '',
    cityTown: '',
    stateProvince: '',
    country: '',
    pinCodeZipCode: '',
  },
  contact: {
    countryCode: '',
    officialContactNumber: '',
    officialEmailId: '',
    officialWebsiteApp: '',
    contactPersonName: '',
    contactPersonDesignation: '',
    mostComfortablePreferredLanguages: [],
  },
  workingHours: {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: '',
  },
};

export function ProfileCreatePage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const createProfile = useCreateProfile();

  const methods = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty, isSubmitting },
    setError,
  } = methods;

  const isDisabled = watch('isDisabled');
  const isWomen = watch('isWomenEntrepreneur');

  const onSubmit = async (values: ProfileFormValues) => {
    // strip empty-string optionals before sending
    const dto = {
      ...values,
      isWomenEntrepreneur: values.isWomenEntrepreneur ?? false,
      professionalTitle: values.professionalTitle || undefined,
      qualifications: values.qualifications || undefined,
      image: values.image || undefined,
      logo: values.logo || undefined,
      subCategoryId: values.subCategoryId || undefined,
      specializations: values.specializations || undefined,
      services: values.services || undefined,
      address: { ...values.address, pinCodeZipCode: values.address.pinCodeZipCode ?? '' },
      contact: {
        countryCode: values.contact?.countryCode ?? '',
        officialContactNumber: values.contact?.officialContactNumber ?? '',
        officialEmailId: values.contact?.officialEmailId ?? '',
        officialWebsiteApp: values.contact?.officialWebsiteApp ?? '',
        contactPersonName: values.contact?.contactPersonName ?? '',
        contactPersonDesignation: values.contact?.contactPersonDesignation ?? '',
        mostComfortablePreferredLanguages: values.contact?.mostComfortablePreferredLanguages ?? [],
      },
    };

    try {
      await createProfile.mutateAsync(dto);
      enqueueSnackbar('Profile created.', { variant: 'success' });
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

  return (
    <Box maxWidth={800}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/profiles')}
        sx={{ mb: 2 }}
      >
        Back to Profiles
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h5" fontWeight={700}>
            New Profile
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
              <ProfileForm mode="create" />
              <Box sx={{ display: 'flex', gap: 1, mt: 3, justifyContent: 'flex-end' }}>
                <Button onClick={() => navigate('/profiles')} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || !isDirty}
                >
                  {isSubmitting ? 'Creating…' : 'Create Profile'}
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

export default ProfileCreatePage;
