const EventSource = require('eventsource');
const xml2js = require('xml2js');
const toXML = require('jstoxml');
class SseClient {
    #bearer;
  constructor(url, xmlQuery, callback, customHeaders) 
  {

    let bearer;
    let sseurl;
    const headers = {
        "Content-Type": "application/xml"
    };

    if (customHeaders) {
        Object.assign(headers, customHeaders);
    }

    fetch(url, {
        method: 'POST',
        body: xmlQuery,
        headers: headers
    }).then(response => {
        // test if we have a bearer token
        bearer = response.headers.get('x-auth-token');
        return response.json();
    }).then(data => {
        const sseurl = data.RESPONSE.RESULT[0].INFO.SSEURL;
    
        callback(data.RESPONSE.RESULT[0]);
        
        // Create a new EventSource
        const sseHeader = {
            headers: {}
                
        };
        if (bearer) {
            sseHeader.headers.Authorization = bearer;
        }
        var es = new EventSource(sseurl, sseHeader);
        es.onerror = (event) => {
            console.log('error', event);
        };
        es.onmessage = (event) => {
            callback(JSON.parse(event.data).RESPONSE.RESULT[0]);
        };

        
    }).catch((error) => {
        console.error('Error:', error);
    });   
    
  }
  
} 

class PullClient {
    #queryXML;
    #callback;
    #url;
    #interval;
    #customHeaders;
    #dateTimeField;
    constructor (url, xmlQuery, dateTimeField, interval, callback, customHeaders) {
        let datetime = new Date();
        // remove milliseconds datetime (specified in inteval)
        datetime.getTime(datetime.getTime() - datetime.getTime() % interval);
        // convert datetime to string
        const dateTimeValue = datetime.toISOString();
        this.#dateTimeField = dateTimeField;
        this.#queryXML = xmlQuery;
        this.#callback = callback;
        this.#url = url;
        this.#customHeaders = customHeaders;
    
        this.#fetchData(this.#modifyXml(xmlQuery, dateTimeField, dateTimeValue), dateTimeField);
    }

    #fetchData = (xmlQuery) => {
        const headers = {
            "Content-Type": "application/xml"
        };
        if (this.#customHeaders) {
            Object.assign(headers, this.#customHeaders);
        }
        console.log('Fetching data', xmlQuery);
        fetch(this.#url, {
            method: 'POST',
            body: xmlQuery,
            headers: headers
        }).then(response => {
            return response.json();
        }).then(data => {

            const key = Object.keys(data.RESPONSE.RESULT[0])[0];
            const values = data.RESPONSE.RESULT[0][key].map((x) => x[this.#dateTimeField]);
            values.sort((a, b) => {
                return b - a;
            });

            // Om vi inte har någon data så kör vi samma xml igen:
            let xml;
            if (values.length === 0) {
                console.log('No data');
                xml = xmlQuery;
            }
            else {
                const dateTimeValue = values[0];
                console.log('Data:', dateTimeValue);
                xml = this.#modifyXml(this.#queryXML, this.#dateTimeField, dateTimeValue);
                this.#callback(data.RESPONSE.RESULT[0]);
            }

            setTimeout(() => {
                this.#fetchData(xml)
            }, 20000);


        }).catch((error) => {
            console.error('Error:', error);
        });
    }

    #modifyXml = (xml, dateTimeField, dateTimeValue) => {
        let returnXml;
        xml2js.parseString(xml, (err, result) => {
            if (err) throw err;
            let QUERY = result.REQUEST.QUERY[0];
            let filter;
            filter = result.REQUEST.QUERY[0].FILTER;
            console.log('Filter:', filter);
            let found = false;
            if (filter) {
                filter.forEach(element => {
                    if (element.GT && element.GT[0].$.name === dateTimeField) {
                        element.GT[0].$.value = dateTimeValue;
                        found = true;
                    }
                });
                if (!found) {
                    filter.push({
                        GT: {$: {name: dateTimeField, value: dateTimeValue}}
                    });
                }
            }
            else {
                // create gt node with name and value attributes:
                filter.push({
                    GT: {$: {name: dateTimeField, value: dateTimeValue}}
                });
            }

            
            var builder = new xml2js.Builder();
            returnXml = builder.buildObject(result);

        });
        return returnXml;
    }
    
}
module.exports = {
    SseClient,
    PullClient
};
