# trv-api-subscriber
The Swedish Transport Administration provides an open API for trainrunning data (and road realated data). If attribute ```sseurl="true"``` is added to the query tag, the API response will include an url for subscribing to new events through server send events (SSE).

Example usage:

```
// reference to module
const {SseClient} = require('trv-api-subscriber');

// TRV Query
const tposQuery = `<REQUEST>
<LOGIN authenticationkey="${openApiKey}"/>
  <QUERY objecttype="TrainPosition" namespace="järnväg.trafikinfo" schemaversion="1.1" sseurl="true">
    <FILTER>
      <GT name="TimeStamp" value="${currentDateTimeIso}"/>    
    </FILTER>
    
  </QUERY>
</REQUEST>
`;

new SseClient(openApiUrl, tposQuery, (data) => {
    console.log(data);
});
```
