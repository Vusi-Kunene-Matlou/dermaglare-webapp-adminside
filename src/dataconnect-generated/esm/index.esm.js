import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'web-app',
  location: 'us-east4'
};

export const addNewClientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddNewClient', inputVars);
}
addNewClientRef.operationName = 'AddNewClient';

export function addNewClient(dcOrVars, vars) {
  return executeMutation(addNewClientRef(dcOrVars, vars));
}

export const listServicesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListServices');
}
listServicesRef.operationName = 'ListServices';

export function listServices(dc) {
  return executeQuery(listServicesRef(dc));
}

export const updateAppointmentNotesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateAppointmentNotes', inputVars);
}
updateAppointmentNotesRef.operationName = 'UpdateAppointmentNotes';

export function updateAppointmentNotes(dcOrVars, vars) {
  return executeMutation(updateAppointmentNotesRef(dcOrVars, vars));
}

export const listClientsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListClients');
}
listClientsRef.operationName = 'ListClients';

export function listClients(dc) {
  return executeQuery(listClientsRef(dc));
}

