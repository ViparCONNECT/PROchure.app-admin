import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { getPaymentLink } from '@/api/profiles';
import type { PaymentLink, Profile } from '@/api/types';
import { parseApiError } from '@/utils/api-error';
import { formatDateTime } from '@/utils/formatters';

interface Props {
  profile: Profile | null;
  onClose: () => void;
}

/** Shows (and copies) the no-login "Pay & Subscribe" link for a profile. */
export function PaymentLinkDialog({ profile, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  const load = async (regenerate = false) => {
    if (!profile) return;
    setBusy(true);
    setError(null);
    try {
      setLink(await getPaymentLink(profile.id, regenerate));
      qc.invalidateQueries({ queryKey: ['profiles'] });
      if (regenerate) enqueueSnackbar('New payment link created. The old link no longer works.', { variant: 'info' });
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setBusy(false);
      setConfirmRegenerate(false);
    }
  };

  useEffect(() => {
    setLink(null);
    setConfirmRegenerate(false);
    if (profile) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.url);
      enqueueSnackbar('Payment link copied.', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not copy automatically — select the link and copy it.', { variant: 'warning' });
    }
  };

  return (
    <Dialog open={!!profile} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Payment link — {profile?.name}</DialogTitle>
      <DialogContent>
        {busy && !link ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : link ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {link.paid ? (
              <Alert severity="success">
                Fee already paid{link.paidAt ? ` on ${formatDateTime(link.paidAt)}` : ''}. The link now just shows
                "Subscription paid".
              </Alert>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Share this link with the profile owner. It opens the Pay &amp; Subscribe page without login and works
                until the fee is paid. Paying also re-enables the profile if it was disabled.
              </Typography>
            )}
            <TextField
              value={link.url}
              fullWidth
              size="small"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Copy">
                      <IconButton onClick={copy} edge="end" size="small">
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Open">
                      <IconButton component="a" href={link.url} target="_blank" rel="noopener noreferrer" size="small">
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              onFocus={(e) => e.target.select()}
            />
            {confirmRegenerate && (
              <Alert
                severity="warning"
                action={
                  <Button color="inherit" size="small" onClick={() => void load(true)} disabled={busy}>
                    Yes, replace
                  </Button>
                }
              >
                The current link will stop working for anyone you've already sent it to.
              </Alert>
            )}
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {link && !link.paid && !confirmRegenerate && (
          <Button color="warning" onClick={() => setConfirmRegenerate(true)} disabled={busy} sx={{ mr: 'auto' }}>
            Generate new link
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={copy} disabled={!link}>
          Copy link
        </Button>
      </DialogActions>
    </Dialog>
  );
}
