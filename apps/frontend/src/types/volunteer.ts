export type VolunteerShiftDetails = {
  eventName: string;
  shiftType: string;
  shiftTime: string;
};

export type Volunteer = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email?: string;
  phoneNumber?: string;
  age?: number;
  isAdult?: boolean;
  userType?: string;
  notes?: string;
  shiftDetails?: VolunteerShiftDetails;
};
