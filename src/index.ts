import * as grpc from "@grpc/grpc-js"
import {IGreeter, greeterDefinition} from "./protos/helloworld_pb.grpc-server.js";
import {AleoNetworkClient} from "@provablehq/sdk";
import {HelloReply} from "./protos/helloworld_pb.js";

const exampleService: IGreeter = {
    // implement your service here
    sayHello: async (call, callback) =>{
        let public_connection = new AleoNetworkClient("https://api.explorer.provable.com/v1");
        console.log(call.request.name)
        const reply = HelloReply.create()
        reply.message = `最新块：${await public_connection.getLatestHeight()}`
        callback(null, reply)
    }
};

const server = new grpc.Server();
server.addService(greeterDefinition, exampleService);
server.bindAsync(
    '0.0.0.0:5050',
    grpc.ServerCredentials.createInsecure(),
    (err: Error | null, port: number) => {
        if (err) {
            console.error(`Server error: ${err.message}`);
        } else {
            console.log(`Server bound on port: ${port}`);
            server.start();
        }
    }
);
