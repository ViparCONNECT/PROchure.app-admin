import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSnackbar } from 'notistack';
import { useCreateProfile } from '@/api/profiles';
import { AdminProfileEditor, type AdminProfileSaveInput } from '@/components/profile/AdminProfileEditor';
import { PROFILE_TYPE_LABEL, PROFILE_TYPE_OPTIONS } from '@/profile-kit/constants';
import { emptyFormValues } from '@/profile-kit/format';
import type { ProfileType } from '@/profile-kit/types';

const isProfileType = (v: string | null): v is ProfileType => PROFILE_TYPE_OPTIONS.some((o) => o.value === v);

export function ProfileCreatePage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const createProfile = useCreateProfile();
  const [params, setParams] = useSearchParams();
  const typeParam = params.get('type');
  const profileType = isProfileType(typeParam) ? typeParam : null;
  const initialValues = useMemo(() => emptyFormValues(), []);

  const handleSave = async ({ payload, owner, isDisabled }: AdminProfileSaveInput) => {
    await createProfile.mutateAsync({ ...payload, owner, isDisabled });
    enqueueSnackbar('Profile created and published. The owner can now log in on the app.', { variant: 'success' });
    navigate('/profiles');
  };

  return (
    <Box maxWidth={1280}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => (profileType ? setParams({}) : navigate('/profiles'))}
        sx={{ mb: 2 }}
      >
        {profileType ? 'Change profile type' : 'Back to Profiles'}
      </Button>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        New Profile{profileType ? ` — ${PROFILE_TYPE_LABEL[profileType]}` : ''}
      </Typography>

      {!profileType ? (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, maxWidth: 720 }}>
          {PROFILE_TYPE_OPTIONS.map((o) => (
            <Card key={o.value} variant="outlined">
              <CardActionArea onClick={() => setParams({ type: o.value })} sx={{ p: 1 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700}>
                    {o.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {o.value === 'PROFESSIONAL_CONSULTANT'
                      ? 'Independent professionals and professional consultancies'
                      : 'Service brands and retail brands / outlets'}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      ) : (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <AdminProfileEditor
              key={profileType}
              profileType={profileType}
              initialValues={initialValues}
              submitLabel="Create & publish profile"
              onSave={handleSave}
              onCancel={() => navigate('/profiles')}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default ProfileCreatePage;
