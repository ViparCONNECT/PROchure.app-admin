import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import { createAdminSchema, type CreateAdminFormValues } from '@/schemas/admin.schema';
import { useCreateAdmin } from '@/api/admins';
import { FormRenderer } from '@/components/common/FormRenderer';
import { UnsavedChangesGuard } from '@/components/common/UnsavedChangesGuard';
import { ADMIN_CREATE_FIELDS } from '@/config/formFields';
import { parseApiError } from '@/utils/api-error';

export function AdminCreatePage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const createAdmin = useCreateAdmin();

  const methods = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', role: 'ADMIN' },
  });

  const { handleSubmit, formState: { isDirty, isSubmitting }, setError } = methods;

  const onSubmit = async (values: CreateAdminFormValues) => {
    try {
      await createAdmin.mutateAsync(values);
      enqueueSnackbar('Admin account created.', { variant: 'success' });
      navigate('/admins');
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.fieldErrors) {
        Object.entries(parsed.fieldErrors).forEach(([field, msg]) => {
          setError(field as keyof CreateAdminFormValues, { message: msg });
        });
      } else {
        enqueueSnackbar(parsed.message, { variant: 'error' });
      }
    }
  };

  return (
    <Box maxWidth={640}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/admins')}
        sx={{ mb: 2 }}
      >
        Back to Admins
      </Button>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        New Admin
      </Typography>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <FormProvider {...methods}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <FormRenderer fields={ADMIN_CREATE_FIELDS} mode="create" />
              <Box sx={{ display: 'flex', gap: 1, mt: 3, justifyContent: 'flex-end' }}>
                <Button onClick={() => navigate('/admins')} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting || !isDirty}>
                  {isSubmitting ? 'Creating…' : 'Create Admin'}
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

export default AdminCreatePage;
