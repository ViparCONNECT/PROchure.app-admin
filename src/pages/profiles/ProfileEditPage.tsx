import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSnackbar } from 'notistack';
import { useProfile, useUpdateProfile } from '@/api/profiles';
import { AdminProfileEditor, type AdminProfileSaveInput } from '@/components/profile/AdminProfileEditor';
import { PageError } from '@/components/common/ErrorDisplay';
import { PROFILE_TYPE_LABEL } from '@/profile-kit/constants';
import { toFormValues } from '@/profile-kit/format';
import { parseApiError } from '@/utils/api-error';

export function ProfileEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const updateProfile = useUpdateProfile();
  const { data: profile, isLoading, error, refetch } = useProfile(id!);

  const initialValues = useMemo(() => (profile ? toFormValues(profile) : null), [profile]);
  const profileType = profile?.category?.type;

  const handleSave = async ({ payload, owner, isDisabled }: AdminProfileSaveInput) => {
    await updateProfile.mutateAsync({
      id: id!,
      dto: { ...payload, isDisabled, owner: profile?.user ? undefined : owner },
    });
    enqueueSnackbar('Profile updated.', { variant: 'success' });
    navigate('/profiles');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error || !profile || !initialValues || !profileType) {
    return <PageError message={error ? parseApiError(error).message : 'Profile not found'} onRetry={refetch} />;
  }

  return (
    <Box maxWidth={1280}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/profiles')} sx={{ mb: 2 }}>
        Back to Profiles
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h5" fontWeight={700}>
          Edit Profile — {PROFILE_TYPE_LABEL[profileType]}
        </Typography>
        {profile.status === 'PENDING_PAYMENT' && <Chip label="Pending payment" color="warning" size="small" />}
        {profile.isDisabled && <Chip label="Disabled" size="small" />}
      </Box>

      {!profile.user && (
        <Alert severity="info" sx={{ mb: 2 }}>
          This profile has no owner login yet. Enter the owner's email and mobile number to create one.
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 3 }}>
          <AdminProfileEditor
            key={profile.id}
            profileType={profileType}
            initialValues={initialValues}
            initialOwner={profile.user}
            ownerLocked={!!profile.user}
            initialDisabled={profile.isDisabled}
            submitLabel="Save changes"
            onSave={handleSave}
            onCancel={() => navigate('/profiles')}
          />
        </CardContent>
      </Card>
    </Box>
  );
}

export default ProfileEditPage;
