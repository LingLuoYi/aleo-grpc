import * as grpc from "@grpc/grpc-js"
import {restServiceDefinition} from "./protos/aleo_pb.grpc-server.js";
import {AleoService} from "./service/AleoService.js";

const server = new grpc.Server();
server.addService(restServiceDefinition, new AleoService("https://api.explorer.provable.com/v1"));
server.bindAsync(
    '0.0.0.0:10010',
    grpc.ServerCredentials.createInsecure(),
    (err: Error | null, port: number) => {
        if (err) {
            console.error(`Server error: ${err.message}`);
        } else {
            console.log(`Server bound on port: ${port}`);
        }
    }
);
