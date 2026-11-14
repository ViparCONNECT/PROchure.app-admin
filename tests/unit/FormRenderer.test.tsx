import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { ThemeProvider } from '@mui/material/styles';
import { FormRenderer } from '@/components/common/FormRenderer';
import { emptyFormValues, validateProfile } from '@/profile-kit/format';
import theme from '@/theme';
import type { FormFieldDefinition } from '@/api/types';

function Wrapper({ fields, mode = 'create' }: { fields: FormFieldDefinition[]; mode?: 'create' | 'edit' }) {
  const methods = useForm({ defaultValues: {} });
  return (
    <ThemeProvider theme={theme}>
      <FormProvider {...methods}>
        <form>
          <FormRenderer fields={fields} mode={mode} />
        </form>
      </FormProvider>
    </ThemeProvider>
  );
}

describe('FormRenderer', () => {
  it('renders a text field', () => {
    render(
      <Wrapper
        fields={[{ name: 'title', label: 'Title', type: 'text', required: true }]}
      />,
    );
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  });

  it('renders an email field', () => {
    render(
      <Wrapper
        fields={[{ name: 'email', label: 'Email', type: 'email', required: true }]}
      />,
    );
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute('type', 'email');
  });

  it('renders a password field with show/hide toggle', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper
        fields={[{ name: 'password', label: 'Password', type: 'password', required: true }]}
      />,
    );
    const input = screen.getByLabelText(/password/i, { selector: 'input' }) as HTMLInputElement;
    expect(input.type).toBe('password');
    const toggle = screen.getByRole('button', { name: /show password/i });
    await user.click(toggle);
    expect(input.type).toBe('text');
  });

  it('renders a select field with options', () => {
    render(
      <Wrapper
        fields={[
          {
            name: 'role',
            label: 'Role',
            type: 'select',
            required: true,
            options: [
              { label: 'Admin', value: 'ADMIN' },
              { label: 'Super Admin', value: 'SUPER_ADMIN' },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
  });

  it('hides create-only fields in edit mode', () => {
    render(
      <Wrapper
        mode="edit"
        fields={[
          { name: 'password', label: 'Password', type: 'password', create: true, edit: false },
          { name: 'email', label: 'Email', type: 'email', create: true, edit: true },
        ]}
      />,
    );
    expect(screen.queryByLabelText(/password/i)).toBeNull();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders a boolean checkbox', () => {
    render(
      <Wrapper
        fields={[{ name: 'isActive', label: 'Active', type: 'boolean' }]}
      />,
    );
    expect(screen.getByRole('checkbox', { name: /active/i })).toBeInTheDocument();
  });

  it('renders a section with nested fields', () => {
    render(
      <Wrapper
        fields={[
          {
            name: 'address',
            label: 'Address',
            type: 'section',
            fields: [
              { name: 'address.city_town', label: 'City', type: 'text', required: true },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
  });

  it('allows empty admin profile address, hours and preferred languages', () => {
    const values = emptyFormValues();
    values.categoryId = 'cat_1';
    values.consultantKind = 'CONSULTANCY';
    values.name = 'Dr. Asha Rao';
    values.servicesOffered = 'Consulting';
    values.sinceYear = '2020';
    values.phones = [{ code: '+91', number: '9876543210' }];
    values.emails = ['asha@example.com'];
    values.address.cityTown = '';
    values.address.stateProvince = '';
    values.address.country = '';
    values.workingHours = {
      weekdays: { closed: false, open: '', close: '', breakStart: '', breakEnd: '' },
      saturday: { closed: false, open: '', close: '', breakStart: '', breakEnd: '' },
      sunday: { closed: true, open: '', close: '', breakStart: '', breakEnd: '' },
    };
    values.languages = [];

    expect(validateProfile('PROFESSIONAL_CONSULTANT', values, false)).toEqual({});
  });
});
