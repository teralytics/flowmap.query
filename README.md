# flowmap.query

An exploratory visualization tool for the analysis of movements between geographic locations (Origin-Destination data with attributes).

Try the [LIVE DEMO](http://query.flowmap.blue:3001/citibike).

[![flowmap.query](https://user-images.githubusercontent.com/351828/61302543-3f6dfc00-a7e6-11e9-8a5f-3451a9f5c6f1.png)](http://query.flowmap.blue:3001/citibike)




##  Database 
flowmap.query currently only supports [ClickHouse](https://clickhouse.yandex/) as its database backend.
We plan to add support for BigQuery and Google Sheets in the future. 

### ClickHouse
ClickHouse is a [scalable column-oriented database](https://clickhouse.yandex/docs/en/). 
It's shows [amazing query performance](https://tech.marksblogg.com/billion-nyc-taxi-rides-clickhouse-cluster.html) 
especially for aggregation queries over large single-table datasets. 
This makes ClickHouse a great choice for supporting interactive analysis of OD-datasets with attributes. 

## Setting up a server in the cloud
For hosting a single-node ClickHouse database in the cloud we recommend DigitalOcean. 

Running flowmap.query on DigitalOcean:
[Step-by-step installation guide](https://github.com/teralytics/flowmap.query/wiki/How-to-set-up-and-run-flowmap.query-on-DigitalOcean).

### Related reading
  - [How to install ClickHouse in DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-clickhouse-on-ubuntu-18-04).
  - [How to set up a Node.js app in DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-18-04).
  - [A tutorial describing how to load  US flight delays dataset](https://clickhouse.yandex/tutorial.html) containing 166 million rows into ClickHouse.
  - Benchmarking ClickHouse on the 1.1 Billion Taxi Rides dataset: 
[on a single machine](https://tech.marksblogg.com/billion-nyc-taxi-clickhouse.html) and 
[in an AWS EC2 cluster](https://tech.marksblogg.com/billion-nyc-taxi-rides-clickhouse-cluster.html). 
The author also describes in detail how to prepare and ingest the whole dataset.   

## Running locally
  
Add a `.env` file with ClickHouse URL:
  
    CLICKHOUSE_URL=http://localhost:8123?enable_http_compression=1&password=YOUR_CLICKHOUSE_PASSWORD"
  
Add a `client/.env` file with the Mapbox access token:
  
    REACT_APP_MapboxAccessToken=...
    
To build:

    npm install
    cd client && npm install && npm run build && cd ..
  
Then, to start in production mode:

    npm start      

### Running in dev mode
Run in the root folder:
  
    npm run dev

Alternatively, you can run the server and the client separately:

    npm run dev:server
    npm run dev:client
    
    
    
## Credits

Developed by [Ilya Boyandin](https://ilya.boyandin.me) at [Teralytics](https://www.teralytics.net/).
