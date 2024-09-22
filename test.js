const {SseClient, PullClient} = require('./index');
//const url = process.env.TRV_OPEN_API_URL;
const url = process.env.APIM_API_URL;
//const key = process.env.TRV_OPEN_API_KEY;
const key = process.env.APIM_API_KEY;

const xmlQuery = `<REQUEST>
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

//const client = new SseClient(url, xmlQuery, (data) => {
//    console.log(data);
//});

const pullClient = new PullClient(url, xmlQuery, 'TrainLocationReport.LocationDateTime', 5000, (data)  => {
    console.log(data);
  },{'Ocp-Apim-Subscription-Key': process.env.APIM_API_KEY}
);