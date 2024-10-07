const https = require('https');
class SseClient {
    #bearer;
    constructor (url, xmlQuery, callback, customHeaders) {

        // Make a POST request to the TRV API
        fetch(url, {
            method: 'POST',
            body: xmlQuery,
            headers: customHeaders
        }).then(response => {
            // test if we have a bearer token
            this.#bearer = response.headers.get('x-auth-token');
            return response.json();
        }).then(data => {
            if (!data.RESPONSE.RESULT[0].INFO && !data.RESPONSE.RESULT[0].INFO.SSEURL) {
                throw new Error('No SSE URL found in the response');
            }
            const sseurl = data.RESPONSE.RESULT[0].INFO.SSEURL;
        
            callback(data.RESPONSE.RESULT[0]);
            
            // Create a new EventSource
            const sseHeader = {
                headers: {}
                    
            };
            if (this.#bearer) {
                sseHeader.headers.Authorization = this.#bearer;
            }
            https.get(sseurl, sseHeader, (response) => {

                // Check if the content type is 'text/event-stream'
                if (response.headers['content-type'].includes('text/event-stream')) {
                    
                    let eventBuffer = '';  // Buffer to collect chunks for each event

                    response.on('data', (chunk) => {
                        if (chunk.toString().startsWith('id:')) {
                            // Split the buffer into individual events
                            const events = eventBuffer.split('data: ');
                             if (events.length > 1) {
                                try {
                                    // Parse each event as JSON
                                    const json = JSON.parse(events[1]);
                                    // Call the callback function with the parsed events
                                    callback(json.RESPONSE.RESULT[0]);
                                }
                                catch (error) {
                                    console.error('Error parsing JSON:', error);
                                }
                             }
                            eventBuffer = '';
                            eventBuffer = chunk.toString();
                        }
                        else {
                            eventBuffer += chunk.toString();
                        }
                        
                    });
              
                  response.on('end', () => {
                    console.log('SSE stream ended');
                  });
                } else {
                  console.error('The response is not an SSE stream');
                }
              }).on('error', (error) => {
                console.error('Error connecting to SSE source:', error);
              });               
    
        }).catch((error) => {
            console.error('Error:', error);
        });                
    }    
}
module.exports = {
    SseClient
};