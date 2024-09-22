const {SseClient, PullClient} = require('./index');
const url = process.env.TRV_OPEN_API_URL;
const key = process.env.TRV_OPEN_API_KEY;

const xmlQuery = `<REQUEST>
      <LOGIN authenticationkey="${key}"/>
  <QUERY objecttype="TrainAnnouncement" schemaversion="1.9" limit="10">
    <FILTER>
      <GT name="TimeAtLocation" value="2024-09-22T14:14:00.000+02:00"/>
    </FILTER>
  </QUERY>
</REQUEST>  
`;    

//const client = new SseClient(url, xmlQuery, (data) => {
//    console.log(data);
//});

const pullClient = new PullClient(url, xmlQuery, 'TimeAtLocation', 5000, (data) => {
    console.log(data);
});