import { useState, useCallback, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

// ─── Types ────────────────────────────────────────────────────────────────────

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type Day = (typeof DAYS)[number];
const WEEKDAYS: Day[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const DAY_LABELS: Record<Day, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};

interface DayState {
  closed: boolean;
  morningStart: Dayjs | null;
  morningEnd: Dayjs | null;
  hasLunch: boolean;
  afternoonStart: Dayjs | null;
  afternoonEnd: Dayjs | null;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

// ─── String ↔ State ───────────────────────────────────────────────────────────

function parseTimeStr(s: string): Dayjs | null {
  if (!s) return null;
  const d = dayjs(s.trim(), 'hh:mm A');
  return d.isValid() ? d : null;
}

function toTimeStr(d: Dayjs | null): string {
  return d?.format('hh:mm A') ?? '12:00 AM';
}

function stringToState(raw: string | undefined): DayState {
  if (!raw || raw.startsWith('00:00') || raw === 'Closed') {
    return { closed: true, morningStart: null, morningEnd: null, hasLunch: false, afternoonStart: null, afternoonEnd: null };
  }
  const parts = raw.split(' | ');
  const [ms, me] = (parts[0] ?? '').split(' to ');
  const hasLunch = parts[1] === 'Lunch Break';
  const [as_, ae] = hasLunch ? (parts[2] ?? '').split(' to ') : ['', ''];
  return {
    closed: false,
    morningStart: parseTimeStr(ms),
    morningEnd: parseTimeStr(me),
    hasLunch,
    afternoonStart: parseTimeStr(as_),
    afternoonEnd: parseTimeStr(ae),
  };
}

function stateToString(s: DayState): string {
  if (s.closed) return '';
  const morning = `${toTimeStr(s.morningStart)} to ${toTimeStr(s.morningEnd)}`;
  if (!s.hasLunch) return morning;
  return `${morning} | Lunch Break | ${toTimeStr(s.afternoonStart)} to ${toTimeStr(s.afternoonEnd)}`;
}

// ─── DayRow ───────────────────────────────────────────────────────────────────

interface DayRowProps {
  day: Day;
  state: DayState;
  onUpdate: (u: Partial<DayState>) => void;
}

function DayRow({ day, state, onUpdate }: DayRowProps) {
  const isWeekend = day === 'saturday' || day === 'sunday';
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 2 },
          flexWrap: 'wrap',
          py: 1.5,
        }}
      >
        {/* Day label */}
        <Box sx={{ width: { xs: '100%', sm: 110 }, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography fontWeight={600} color={isWeekend ? 'secondary.main' : 'text.primary'}>
            {DAY_LABELS[day]}
          </Typography>
          {state.closed && <Chip label="Closed" size="small" color="default" />}
        </Box>

        {/* Closed toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={state.closed}
              onChange={(e) => onUpdate({ closed: e.target.checked })}
              size="small"
            />
          }
          label={<Typography variant="body2">Closed</Typography>}
          sx={{ m: 0, mr: 1 }}
        />

        {!state.closed && (
          <>
            {/* Morning session */}
            <TimePicker
              label="Opens"
              value={state.morningStart}
              onChange={(val) => onUpdate({ morningStart: val })}
              slotProps={{ textField: { size: 'small', sx: { width: 135 } } }}
            />
            <Typography variant="body2" color="text.disabled">to</Typography>
            <TimePicker
              label="Closes"
              value={state.morningEnd}
              onChange={(val) => onUpdate({ morningEnd: val })}
              slotProps={{ textField: { size: 'small', sx: { width: 135 } } }}
            />

            {/* Lunch break */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.hasLunch}
                  onChange={(e) => onUpdate({ hasLunch: e.target.checked })}
                  size="small"
                />
              }
              label={<Typography variant="body2">Lunch Break</Typography>}
              sx={{ m: 0 }}
            />

            {/* Afternoon session */}
            {state.hasLunch && (
              <>
                <TimePicker
                  label="Reopens"
                  value={state.afternoonStart}
                  onChange={(val) => onUpdate({ afternoonStart: val })}
                  slotProps={{ textField: { size: 'small', sx: { width: 135 } } }}
                />
                <Typography variant="body2" color="text.disabled">to</Typography>
                <TimePicker
                  label="Closes"
                  value={state.afternoonEnd}
                  onChange={(val) => onUpdate({ afternoonEnd: val })}
                  slotProps={{ textField: { size: 'small', sx: { width: 135 } } }}
                />
              </>
            )}
          </>
        )}
      </Box>
      <Divider />
    </Box>
  );
}

// ─── WorkingHoursSection ──────────────────────────────────────────────────────

export function WorkingHoursSection() {
  const { setValue, getValues } = useFormContext();

  const [dayStates, setDayStates] = useState<Record<Day, DayState>>(() => {
    const wh = (getValues('workingHours') ?? {}) as Record<string, string>;
    return DAYS.reduce(
      (acc, day) => { acc[day] = stringToState(wh[day]); return acc; },
      {} as Record<Day, DayState>,
    );
  });

  // Re-sync local state when form is reset externally (e.g. edit page load)
  // Uses value comparison to avoid infinite loops with updateDay's own setValue calls
  const formWorkingHours = useWatch({ name: 'workingHours' }) as Record<string, string> | undefined;
  useEffect(() => {
    const wh = formWorkingHours ?? {};
    setDayStates((prev) => {
      let changed = false;
      const next = { ...prev };
      DAYS.forEach((day) => {
        const formVal = wh[day] ?? '';
        if (formVal !== stateToString(prev[day])) {
          next[day] = stringToState(formVal);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [formWorkingHours]);

  const updateDay = useCallback(
    (day: Day, updates: Partial<DayState>) => {
      setDayStates((prev) => {
        const next = { ...prev[day], ...updates };
        setValue(`workingHours.${day}`, stateToString(next), { shouldDirty: true });
        return { ...prev, [day]: next };
      });
    },
    [setValue],
  );

  const copyMondayToWeekdays = () => {
    const monday = dayStates.monday;
    const mondayStr = stateToString(monday);
    WEEKDAYS.forEach((day) => {
      if (day !== 'monday') {
        setValue(`workingHours.${day}`, mondayStr, { shouldDirty: true });
      }
    });
    setDayStates((prev) => {
      const next = { ...prev };
      WEEKDAYS.forEach((day) => { if (day !== 'monday') next[day] = { ...monday }; });
      return next;
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>Working Hours</Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ContentCopyIcon fontSize="small" />}
            onClick={copyMondayToWeekdays}
          >
            Copy Mon → All Weekdays
          </Button>
        </Box>
        <Divider sx={{ mb: 1 }} />

        {DAYS.map((day) => (
          <DayRow
            key={day}
            day={day}
            state={dayStates[day]}
            onUpdate={(updates) => updateDay(day, updates)}
          />
        ))}
      </Box>
    </LocalizationProvider>
  );
}

export default WorkingHoursSection;
