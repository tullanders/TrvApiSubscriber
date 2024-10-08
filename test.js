const {SseClient} = require('./index');
const openApiUrl = process.env.TRV_OPEN_API_URL;
const apimUrl = process.env.APIM_API_URL;
const openApiKey = process.env.TRV_OPEN_API_KEY;
const apimKey = process.env.APIM_API_KEY;

const trimQuery = `<REQUEST>
  <QUERY objecttype="TrainRunningInformationMessage" namespace="TafTap" schemaversion="1.0" limit="200" orderby="TrainLocationReport.LocationDateTime">
    <FILTER>
      <GT name="TrainLocationReport.LocationDateTime" value="2024-09-22T22:10:00.000+02:00"/>
        <ELEMENTMATCH>
        <EQ name="TrainOperationalIdentification.TransportOperationalIdentifiers.ObjectType" value="TR" />
        <EQ name="TrainOperationalIdentification.TransportOperationalIdentifiers.Company" value="2174" />
        </ELEMENTMATCH>        
    </FILTER>
  </QUERY>
</REQUEST> 
`;    
const currentDateTimeIso = new Date().toISOString();
const tposQuery = `<REQUEST>
<LOGIN authenticationkey="${openApiKey}"/>
  <QUERY objecttype="TrainPosition" namespace="järnväg.trafikinfo" schemaversion="1.1" sseurl="true">
    <FILTER>
      <GT name="TimeStamp" value="${currentDateTimeIso}"/>    
    </FILTER>
    
  </QUERY>
</REQUEST>
`;

let count = 0;
const currentTime = Date.now();
new SseClient(openApiUrl, tposQuery, (data) => {
    console.log(data.TrainPosition.length, (Date.now()-currentTime)/1000);
});


