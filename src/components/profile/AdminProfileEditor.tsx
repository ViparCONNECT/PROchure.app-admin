import { useCallback, useState } from 'react';
import { AxiosError } from 'axios';
import ProfileForm from '@/profile-kit/ProfileForm';
import { COUNTRY_CODES } from '@/profile-kit/constants';
import { splitPhone, type ProfileFormValues } from '@/profile-kit/format';
import type { CategoryOption, ProfilePayload, ProfileType, SubCategoryOption } from '@/profile-kit/types';
import { fetchCategories, fetchSubCategories } from '@/api/categories';
import type { ProfileOwner } from '@/api/types';
import { UnsavedChangesGuard } from '@/components/common/UnsavedChangesGuard';
import { parseApiError } from '@/utils/api-error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_RE = /^\+[1-9]\d{7,14}$/;

const loadCategories = async (type: ProfileType): Promise<CategoryOption[]> =>
  (await fetchCategories({ type, limit: 500 })).map((c) => ({
    id: c.id,
    name: c.name,
    isSubCategoryNeeded: c.isSubCategoryNeeded,
  }));

const loadSubCategories = async (categoryId: string): Promise<SubCategoryOption[]> =>
  (await fetchSubCategories(categoryId)).map((s) => ({ id: s.id, name: s.name }));

const getErrorMessages = (err: unknown): string[] => {
  if (err instanceof AxiosError && Array.isArray(err.response?.data?.message)) return err.response.data.message;
  return [parseApiError(err).message];
};

export interface AdminProfileSaveInput {
  payload: ProfilePayload;
  owner: ProfileOwner;
  isDisabled: boolean;
}

interface Props {
  profileType: ProfileType;
  initialValues: ProfileFormValues;
  initialOwner?: ProfileOwner | null;
  /** Owner login can't be changed once linked */
  ownerLocked?: boolean;
  initialDisabled?: boolean;
  submitLabel: string;
  onSave: (input: AdminProfileSaveInput) => Promise<void>;
  onCancel: () => void;
}

export function AdminProfileEditor({
  profileType,
  initialValues,
  initialOwner,
  ownerLocked = false,
  initialDisabled = false,
  submitLabel,
  onSave,
  onCancel,
}: Props) {
  const [ownerEmail, setOwnerEmail] = useState(initialOwner?.email ?? '');
  const [ownerPhone, setOwnerPhone] = useState(() => splitPhone(initialOwner?.phone));
  const [isDisabled, setIsDisabled] = useState(initialDisabled);
  const [formDirty, setFormDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const ownerPhoneE164 = ownerPhone.number ? `${ownerPhone.code}${ownerPhone.number.replace(/\D/g, '')}` : '';
  const dirty =
    formDirty ||
    isDisabled !== initialDisabled ||
    ownerEmail !== (initialOwner?.email ?? '') ||
    ownerPhoneE164 !== (initialOwner?.phone ?? '');

  const handleSubmit = useCallback(
    async (payload: ProfilePayload) => {
      const email = ownerEmail.trim().toLowerCase();
      if (!EMAIL_RE.test(email)) throw new Error('Enter a valid owner login email.');
      if (!E164_RE.test(ownerPhoneE164)) throw new Error('Enter a valid owner login mobile number.');
      setSaving(true);
      try {
        await onSave({ payload, owner: { email, phone: ownerPhoneE164 }, isDisabled });
      } finally {
        setSaving(false);
      }
    },
    [ownerEmail, ownerPhoneE164, isDisabled, onSave],
  );

  const header = (
    <fieldset className="pk-fieldset">
      <legend className="pk-legend">Owner login</legend>
      <span className="pk-hint">
        {ownerLocked
          ? 'This profile is linked to the account below. The owner logs in on the app with an OTP sent to this WhatsApp number.'
          : 'A user account is created with these details (no OTP needed). The owner can then log in on the app with this email or mobile number. Admin-created profiles are published without payment.'}
      </span>
      <div className="pk-grid-2">
        <div className="pk-field">
          <label className="pk-label" htmlFor="owner-email">
            Login email<span className="pk-req">*</span>
          </label>
          <input
            id="owner-email"
            className="pk-input"
            type="email"
            value={ownerEmail}
            disabled={ownerLocked}
            onChange={(e) => setOwnerEmail(e.target.value)}
          />
        </div>
        <div className="pk-field">
          <label className="pk-label" htmlFor="owner-phone">
            Login mobile (WhatsApp)<span className="pk-req">*</span>
          </label>
          <div className="pk-row">
            <select
              aria-label="Owner country code"
              className="pk-select pk-code"
              value={ownerPhone.code}
              disabled={ownerLocked}
              onChange={(e) => setOwnerPhone((p) => ({ ...p, code: e.target.value }))}
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.label} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              id="owner-phone"
              className="pk-input pk-grow"
              type="tel"
              inputMode="numeric"
              maxLength={16}
              value={ownerPhone.number}
              disabled={ownerLocked}
              onChange={(e) => setOwnerPhone((p) => ({ ...p, number: e.target.value.replace(/[^\d\s]/g, '') }))}
            />
          </div>
        </div>
      </div>
      <label className="pk-check">
        <input type="checkbox" checked={isDisabled} onChange={(e) => setIsDisabled(e.target.checked)} />
        Disabled (hide this profile from the app)
      </label>
    </fieldset>
  );

  return (
    <>
      <ProfileForm
        profileType={profileType}
        initialValues={initialValues}
        loadCategories={loadCategories}
        loadSubCategories={loadSubCategories}
        getErrorMessages={getErrorMessages}
        onSubmit={handleSubmit}
        onDirtyChange={setFormDirty}
        submitLabel={submitLabel}
        onCancel={onCancel}
        header={header}
      />
      <UnsavedChangesGuard isDirty={dirty && !saving} />
    </>
  );
}
