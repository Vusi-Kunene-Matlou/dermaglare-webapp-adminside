import { AddNewClientData, AddNewClientVariables, ListServicesData, UpdateAppointmentNotesData, UpdateAppointmentNotesVariables, ListClientsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useAddNewClient(options?: useDataConnectMutationOptions<AddNewClientData, FirebaseError, AddNewClientVariables>): UseDataConnectMutationResult<AddNewClientData, AddNewClientVariables>;
export function useAddNewClient(dc: DataConnect, options?: useDataConnectMutationOptions<AddNewClientData, FirebaseError, AddNewClientVariables>): UseDataConnectMutationResult<AddNewClientData, AddNewClientVariables>;

export function useListServices(options?: useDataConnectQueryOptions<ListServicesData>): UseDataConnectQueryResult<ListServicesData, undefined>;
export function useListServices(dc: DataConnect, options?: useDataConnectQueryOptions<ListServicesData>): UseDataConnectQueryResult<ListServicesData, undefined>;

export function useUpdateAppointmentNotes(options?: useDataConnectMutationOptions<UpdateAppointmentNotesData, FirebaseError, UpdateAppointmentNotesVariables>): UseDataConnectMutationResult<UpdateAppointmentNotesData, UpdateAppointmentNotesVariables>;
export function useUpdateAppointmentNotes(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateAppointmentNotesData, FirebaseError, UpdateAppointmentNotesVariables>): UseDataConnectMutationResult<UpdateAppointmentNotesData, UpdateAppointmentNotesVariables>;

export function useListClients(options?: useDataConnectQueryOptions<ListClientsData>): UseDataConnectQueryResult<ListClientsData, undefined>;
export function useListClients(dc: DataConnect, options?: useDataConnectQueryOptions<ListClientsData>): UseDataConnectQueryResult<ListClientsData, undefined>;
