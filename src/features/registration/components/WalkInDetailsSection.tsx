import React from 'react';
import { MapPin } from 'lucide-react';
import type { SessionType } from '../../../types';
import { validationProps, type RegistrationErrors } from '../registrationValidation';
import { RegistrationFieldError } from './RegistrationFieldError';

const invalidBorder = 'aria-invalid:border-red-600 aria-invalid:focus:border-red-600';
const label = 'block text-[11px] font-black text-ink uppercase tracking-wider mb-1.5';
const input = `w-full min-h-[48px] text-sm px-3.5 py-2.5 border border-neutral-400 focus:border-line bg-canvas focus:bg-panel font-bold ${invalidBorder}`;

interface WalkInDetailsSectionProps {
  sessionTypes: SessionType[];
  sessionTypeId: string;
  onSessionTypeChange: (id: string) => void;
  selectedSession?: SessionType;
  eventDate: string;
  onEventDateChange: (value: string) => void;
  eventVenue: string;
  onEventVenueChange: (value: string) => void;
  clientOrg: string;
  onClientOrgChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  errors: RegistrationErrors;
}

/** Walk-in clients: what session they booked, and where/when for events outside the studio. */
export const WalkInDetailsSection: React.FC<WalkInDetailsSectionProps> = ({
  sessionTypes, sessionTypeId, onSessionTypeChange, selectedSession,
  eventDate, onEventDateChange, eventVenue, onEventVenueChange,
  clientOrg, onClientOrgChange, notes, onNotesChange, errors,
}) => (
  <section aria-labelledby="sec-session">
    <div className="flex items-center justify-between pb-2.5 border-b-2 border-line mb-5">
      <h2 id="sec-session" className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] text-ink m-0">
        <span className="font-mono text-gold-soft mr-2">01B //</span>
        Session Details
      </h2>
      <span className="font-mono text-[10px] text-neutral-500 uppercase">Walk-in client</span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor="registration-session_type" className={label}>
          Type of Session <span className="text-red-600">*</span>
        </label>
        <select
          {...validationProps('session_type', errors.session_type)}
          value={sessionTypeId}
          onChange={(event) => onSessionTypeChange(event.target.value)}
          className={`${input} bg-panel`}
        >
          <option value="">{sessionTypes.length ? 'Select a session' : 'No session types available'}</option>
          {sessionTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}{type.on_location ? ' (on location)' : ''}
            </option>
          ))}
        </select>
        <RegistrationFieldError field="session_type" errors={errors} />
      </div>
      <div>
        <label htmlFor="registration-client_org" className={label}>
          Organization / Company <span className="font-normal normal-case">(optional)</span>
        </label>
        <input id="registration-client_org" value={clientOrg} maxLength={120} placeholder="e.g. family name, company, or group"
          onChange={(event) => onClientOrgChange(event.target.value)} className={input} />
      </div>
    </div>

    {selectedSession?.on_location && (
      <div className="mt-4 border border-gold bg-gold-wash p-4">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-ink mb-3">
          <MapPin className="w-4 h-4 text-gold-soft" /> Event outside the studio
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="registration-event_date" className={label}>
              Event Date <span className="text-red-600">*</span>
            </label>
            <input {...validationProps('event_date', errors.event_date)} type="date" value={eventDate}
              onChange={(event) => onEventDateChange(event.target.value)} className={`${input} bg-panel`} />
            <RegistrationFieldError field="event_date" errors={errors} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="registration-event_venue" className={label}>
              Venue / Address <span className="text-red-600">*</span>
            </label>
            <input {...validationProps('event_venue', errors.event_venue)} value={eventVenue} maxLength={200}
              placeholder="e.g. Marco Polo Plaza, Cebu City"
              onChange={(event) => onEventVenueChange(event.target.value)} className={`${input} bg-panel`} />
            <RegistrationFieldError field="event_venue" errors={errors} />
          </div>
        </div>
      </div>
    )}

    <div className="mt-4">
      <label htmlFor="registration-notes" className={label}>
        Notes / Requests <span className="font-normal normal-case">(optional)</span>
      </label>
      <textarea id="registration-notes" value={notes} maxLength={500} rows={2}
        placeholder="e.g. number of people, preferred time, theme"
        onChange={(event) => onNotesChange(event.target.value)}
        className="w-full text-sm px-3.5 py-2.5 border border-neutral-400 focus:border-line bg-canvas focus:bg-panel" />
    </div>
  </section>
);
