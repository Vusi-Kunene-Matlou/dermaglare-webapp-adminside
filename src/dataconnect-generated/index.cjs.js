const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'web-app',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const addNewClientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddNewClient', inputVars);
}
addNewClientRef.operationName = 'AddNewClient';
exports.addNewClientRef = addNewClientRef;

exports.addNewClient = function addNewClient(dcOrVars, vars) {
  return executeMutation(addNewClientRef(dcOrVars, vars));
};

const listServicesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListServices');
}
listServicesRef.operationName = 'ListServices';
exports.listServicesRef = listServicesRef;

exports.listServices = function listServices(dc) {
  return executeQuery(listServicesRef(dc));
};

const updateAppointmentNotesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateAppointmentNotes', inputVars);
}
updateAppointmentNotesRef.operationName = 'UpdateAppointmentNotes';
exports.updateAppointmentNotesRef = updateAppointmentNotesRef;

exports.updateAppointmentNotes = function updateAppointmentNotes(dcOrVars, vars) {
  return executeMutation(updateAppointmentNotesRef(dcOrVars, vars));
};

const listClientsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListClients');
}
listClientsRef.operationName = 'ListClients';
exports.listClientsRef = listClientsRef;

exports.listClients = function listClients(dc) {
  return executeQuery(listClientsRef(dc));
};
