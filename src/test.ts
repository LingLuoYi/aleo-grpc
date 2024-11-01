import {AleoNetworkClient} from "@provablehq/sdk";

let public_connection = new AleoNetworkClient("https://api.explorer.provable.com/v1");
public_connection.getLatestHeight().then(res =>{
    console.log(res)
})
