# trv-api-subscriber
The Swedish Transport Administration (Trafikverket, or just TRV) provides an open API for trainrunning data (and road realated data). If attribute ```sseurl="true"``` is added to the query tag, the API response will include an url for subscribing to new events through server send events (SSE).

[Get your own key here](https://data.trafikverket.se/home)

## Support for API JVG (B2B endpoint)
This plugin supports TRV´s B2B-endpoints. You can define custom headers as arguments. The bearer-token from first request is forwarded in the request to the SSE-endpoint.

## Example usage:

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
