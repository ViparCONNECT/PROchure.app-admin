import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import { editAdminSchema, type EditAdminFormValues } from '@/schemas/admin.schema';
import { useAdmin, useUpdateAdmin } from '@/api/admins';
import { FormRenderer } from '@/components/common/FormRenderer';
import { UnsavedChangesGuard } from '@/components/common/UnsavedChangesGuard';
import { PageError } from '@/components/common/ErrorDisplay';
import { ADMIN_EDIT_FIELDS } from '@/config/formFields';
import { parseApiError } from '@/utils/api-error';

export function AdminEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const updateAdmin = useUpdateAdmin();

  const { data: admin, isLoading, error, refetch } = useAdmin(id!);

  const methods = useForm<EditAdminFormValues>({
    resolver: zodResolver(editAdminSchema),
  });

  const { handleSubmit, reset, formState: { isDirty, isSubmitting }, setError } = methods;

  useEffect(() => {
    if (admin) {
      reset({
        firstName: admin.firstName ?? '',
        lastName: admin.lastName ?? '',
        role: admin.role,
        isActive: admin.isActive,
      });
    }
  }, [admin, reset]);

  const onSubmit = async (values: EditAdminFormValues) => {
    try {
      await updateAdmin.mutateAsync({ id: id!, dto: values });
      enqueueSnackbar('Admin account updated.', { variant: 'success' });
      navigate('/admins');
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.fieldErrors) {
        Object.entries(parsed.fieldErrors).forEach(([field, msg]) => {
          setError(field as keyof EditAdminFormValues, { message: msg });
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
    <Box maxWidth={640}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admins')} sx={{ mb: 2 }}>
        Back to Admins
      </Button>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Edit Admin — {admin ? ((admin.firstName || admin.lastName) ? `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim() : admin.email) : ''}
      </Typography>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <FormProvider {...methods}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <FormRenderer fields={ADMIN_EDIT_FIELDS} mode="edit" />
              <Box sx={{ display: 'flex', gap: 1, mt: 3, justifyContent: 'flex-end' }}>
                <Button onClick={() => navigate('/admins')} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting || !isDirty}>
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

export default AdminEditPage;
