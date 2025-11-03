import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddNewClientData {
  client_insert: Client_Key;
}

export interface AddNewClientVariables {
  firstName: string;
  lastName: string;
  dateOfBirth: DateString;
}

export interface Admin_Key {
  id: UUIDString;
  __typename?: 'Admin_Key';
}

export interface Appointment_Key {
  id: UUIDString;
  __typename?: 'Appointment_Key';
}

export interface Client_Key {
  id: UUIDString;
  __typename?: 'Client_Key';
}

export interface ListClientsData {
  clients: ({
    id: UUIDString;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
  } & Client_Key)[];
}

export interface ListServicesData {
  services: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    price: number;
    durationMinutes: number;
  } & Service_Key)[];
}

export interface Payment_Key {
  id: UUIDString;
  __typename?: 'Payment_Key';
}

export interface Service_Key {
  id: UUIDString;
  __typename?: 'Service_Key';
}

export interface UpdateAppointmentNotesData {
  appointment_update?: Appointment_Key | null;
}

export interface UpdateAppointmentNotesVariables {
  id: UUIDString;
  notes?: string | null;
}

interface AddNewClientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddNewClientVariables): MutationRef<AddNewClientData, AddNewClientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddNewClientVariables): MutationRef<AddNewClientData, AddNewClientVariables>;
  operationName: string;
}
export const addNewClientRef: AddNewClientRef;

export function addNewClient(vars: AddNewClientVariables): MutationPromise<AddNewClientData, AddNewClientVariables>;
export function addNewClient(dc: DataConnect, vars: AddNewClientVariables): MutationPromise<AddNewClientData, AddNewClientVariables>;

interface ListServicesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListServicesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListServicesData, undefined>;
  operationName: string;
}
export const listServicesRef: ListServicesRef;

export function listServices(): QueryPromise<ListServicesData, undefined>;
export function listServices(dc: DataConnect): QueryPromise<ListServicesData, undefined>;

interface UpdateAppointmentNotesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAppointmentNotesVariables): MutationRef<UpdateAppointmentNotesData, UpdateAppointmentNotesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateAppointmentNotesVariables): MutationRef<UpdateAppointmentNotesData, UpdateAppointmentNotesVariables>;
  operationName: string;
}
export const updateAppointmentNotesRef: UpdateAppointmentNotesRef;

export function updateAppointmentNotes(vars: UpdateAppointmentNotesVariables): MutationPromise<UpdateAppointmentNotesData, UpdateAppointmentNotesVariables>;
export function updateAppointmentNotes(dc: DataConnect, vars: UpdateAppointmentNotesVariables): MutationPromise<UpdateAppointmentNotesData, UpdateAppointmentNotesVariables>;

interface ListClientsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListClientsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListClientsData, undefined>;
  operationName: string;
}
export const listClientsRef: ListClientsRef;

export function listClients(): QueryPromise<ListClientsData, undefined>;
export function listClients(dc: DataConnect): QueryPromise<ListClientsData, undefined>;

