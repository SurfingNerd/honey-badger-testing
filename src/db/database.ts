
import createConnectionPool, { Connection, ConnectionPool, Queryable } from '@databases/pg';


import tables from '@databases/pg-typed';
import DatabaseSchema from './schema';
import { ConfigManager } from '../configManager';


/// manage database connection.
// export class Database {

//     private is_connected: boolean = false;

//     private connection?: Connection;

//     public open() {
//         if (this.is_connected) {
//             return;
//         }

//         connection = new Connection(

//         );

//         this.is_connected = true;
//     }

// }


// export {sql};

// const db = createConnectionPool();
// export default db;

// You can list whatever tables you actually have here:
const {headers} = tables<DatabaseSchema>({
  databaseSchema: require('./schema/schema.json'),
});
export {headers};


export async function insertHeader(connectionOrTransaction: Queryable,  
    number: number & {readonly __brand?: 'headers_block_number'},
    hash: string,
    duration: number,
    time: Date,
    extraData: string,
    transactionCount: number,
    txsPerSec: number) {
    //await users(db).insert({email, favorite_color: favoriteColor});

    await headers(connectionOrTransaction).insert({
        block_hash: hash,
        block_duration: duration,
        block_number: number,
        block_time: time, 
        extra_data: extraData,
        transaction_count: transactionCount,
        txs_per_sec: txsPerSec
    });
    //await headers()
  }


export function getDBConnection() : ConnectionPool {

    // let config = ConfigManager.getConfig();
    let networkConfig = ConfigManager.getNetworkConfig();


    const pw = process.env["DMD_DB_POSTGRES"];
    if (!pw || pw.length == 0) {
      let msg =  "Environment variable DMD_DB_POSTGRES is not set.";
        console.log(msg);
        throw Error(msg);
    }
    let connectionString = `postgres://postgres:${pw}@${networkConfig.db}/postgres`;
    // console.log(connectionString);
    return createConnectionPool(connectionString);
}