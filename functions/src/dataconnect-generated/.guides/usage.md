# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { addNewClient, listServices, updateAppointmentNotes, listClients } from '@dataconnect/generated';


// Operation AddNewClient:  For variables, look at type AddNewClientVars in ../index.d.ts
const { data } = await AddNewClient(dataConnect, addNewClientVars);

// Operation ListServices: 
const { data } = await ListServices(dataConnect);

// Operation UpdateAppointmentNotes:  For variables, look at type UpdateAppointmentNotesVars in ../index.d.ts
const { data } = await UpdateAppointmentNotes(dataConnect, updateAppointmentNotesVars);

// Operation ListClients: 
const { data } = await ListClients(dataConnect);


```