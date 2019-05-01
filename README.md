# flowmap.query

An exploratory visualization tool for the analysis of movements between geographic locations (Origin-Destination data with attributes).

![flowmap.query](https://user-images.githubusercontent.com/351828/61302543-3f6dfc00-a7e6-11e9-8a5f-3451a9f5c6f1.png)


##  Database 

flowmap.query currently only supports [ClickHouse](https://clickhouse.yandex/) as its database backend. We plan to add support for BigQuery and Google Sheets in the future. 

ClickHouse is a [scalable column-oriented database](https://clickhouse.yandex/docs/en/). It's shows amazing query performance especially for aggregation queries over large single-table datasets. This makes ClickHouse a great choice for supporting  interactive analysis of such datasets. 

Here is a [tutorial describing how to load  US flight delays dataset](https://clickhouse.yandex/tutorial.html) containing 166 million rows into ClickHouse.

For hosting a ClickHouse database in the cloud we recommend DigitalOcean. Here is a tutorial 
[how to install ClickHouse in DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-clickhouse-on-ubuntu-18-04).

## Running
  
Add a `.env` file with ClickHouse URL:
  
    CLICKHOUSE_URL__local=http://localhost:8123?enable_http_compression=1
  
Add a `client/.env` file with the Mapbox access token:
  
    REACT_APP_MapboxAccessToken=...

### Running in dev mode
Run in the root folder:

    npm run server
    npm run client
    
## Credits

Developed by [Ilya Boyandin](https://ilya.boyandin.me) at [Teralytics](https://www.teralytics.net/).
