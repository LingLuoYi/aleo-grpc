import {IRestService} from "../protos/aleo_pb.grpc-server.js";
import {sendUnaryData, ServerUnaryCall} from "@grpc/grpc-js";
import {
    ExecuteReply,
    ExecuteRequest,
    Execution,
    GetLatestHeightReply, GetProgramMappingNamesReply, GetProgramMappingNamesRequest,
    GetProgramMappingValueReply,
    GetProgramMappingValueRequest,
    GetTransactionReply,
    GetTransactionRequest, TransferBody_TransferType,
    TransferReply,
    TransferRequest,
    Transition, VerifyReply, VerifyRequest
} from "../protos/aleo_pb.js";
import {
    Account,
    AleoNetworkClient,
    AleoKeyProvider,
    NetworkRecordProvider,
    ProgramManager,
    TransactionModel
} from "@provablehq/sdk/mainnet.js";
import {Address, Signature} from "@provablehq/wasm";
import {Status} from "@grpc/grpc-js/build/src/constants.js";
import {Empty} from "../protos/google/protobuf/empty_pb.js";

class AleoService implements IRestService {
    [name: string]: any;

    private readonly connect: AleoNetworkClient;
    private readonly api_url: string;

    constructor(host: string) {
        this.api_url = host;
        this.connect = new AleoNetworkClient(this.api_url); // 初始化连接
    }

    async getTransaction(call: ServerUnaryCall<GetTransactionRequest, GetTransactionReply>, callback: sendUnaryData<GetTransactionReply>): Promise<void> {
        try {
            const hash: string = call.request.hash;
            const transaction: TransactionModel = await this.connect.getTransaction(hash);
            const tr: Transition[] = [];
            for (let i = 0; i < transaction.execution.transitions!.length; i++) {
                const t = transaction.execution.transitions![i];
                tr.push({
                    fee: t.fee ?? 0,
                    function: t.function ?? '',
                    id: t.id ?? '',
                    inputs: t.inputs ?? [],
                    outputs: t.outputs ?? [],
                    program: t.program ?? '',
                    proof: t.proof ?? '',
                    tcm: t.tcm ?? '',
                    tpk: t.tpk ?? ''
                })
            }
            const execution = Execution.create()
            execution.edition = transaction.execution.edition
            execution.transitions = tr
            const reply: GetTransactionReply = {
                id: transaction.id,
                type: transaction.type,
                execution: execution
            }
            callback(null, reply)
        } catch (err: any) {
            console.error(err)
            callback({
                code: Status.UNKNOWN,
                message: err.message,
            })
        }
    }

    async getLatestHeight(call: ServerUnaryCall<Empty, GetLatestHeightReply>, callback: sendUnaryData<GetLatestHeightReply>): Promise<void> {
        try {
            const height = await this.connect.getLatestHeight()
            const reply = GetLatestHeightReply.create()
            reply.result = height
            callback(null, reply)
        } catch (err: any) {
            console.error(err)
            callback({
                code: Status.UNKNOWN,
                message: err.message,
            })
        }
    }

    async getProgramMappingNames(call: ServerUnaryCall<GetProgramMappingNamesRequest, GetProgramMappingNamesReply>, callback: sendUnaryData<GetProgramMappingNamesReply>): Promise<void> {
        try {
            const program_id: string = call.request.programId
            if (!program_id) {
                callback({
                    code: Status.INVALID_ARGUMENT,
                    message: "not program_id"
                })
            }
            const list = await this.connect.getProgramMappingNames(call.request.programId)
            const reply = GetProgramMappingNamesReply.create()
            reply.result = list
            callback(null, reply)
        } catch (err: any) {
            console.error(err)
            callback({
                code: Status.UNKNOWN,
                message: err.message,
            })
        }

    }

    async getProgramMappingValue(call: ServerUnaryCall<GetProgramMappingValueRequest, GetProgramMappingValueReply>, callback: sendUnaryData<GetProgramMappingValueReply>): Promise<void> {
        try {
            const value = await this.connect.getProgramMappingValue(call.request.programId, call.request.mappingName, call.request.mappingKey)
            const reply = GetProgramMappingValueReply.create()
            reply.result = value
            callback(null, reply)
        } catch (err: any) {
            console.error(err)
            callback({
                code: Status.UNKNOWN,
                message: err.message,
            })
        }
    }

    async transfer(call: ServerUnaryCall<TransferRequest, TransferReply>, callback: sendUnaryData<TransferReply>): Promise<void> {
        try {
            const private_key: string = call.request.privateKey
            if (!private_key) {
                callback({
                    code: Status.INVALID_ARGUMENT,
                    message: "not private key"
                })
                return
            }
            const account = new Account({privateKey: private_key});
            const keyProvider = new AleoKeyProvider();
            const recordProvider = new NetworkRecordProvider(account, this.connect);
            const programManager = new ProgramManager(this.api_url, keyProvider, recordProvider);
            const body = call.request.body
            if (!body) {
                callback({
                    code: Status.INVALID_ARGUMENT,
                    message: "not body"
                })
            }
            let type: string = "public"
            if (body!.transferType == TransferBody_TransferType.PRIVATE) {
                type = "private"
            }
            if (TransferBody_TransferType.PRIVATE_TO_PUBLIC == body!.transferType) {
                type = "privateToPublic"
            }
            if (TransferBody_TransferType.PUBLIC_TO_PRIVATE == body!.transferType) {
                type = "publicToPrivate"
            }
            programManager.setAccount(account)
            const tx_id = await programManager.transfer(body!.amount, body!.recipient, type, body!.fee, body!.privateFee)
            const reply = TransferReply.create()
            reply.txId = tx_id
            callback(null, reply)
        } catch (err: any) {
            console.error(err)
            callback({
                code: Status.UNKNOWN,
                message: err.message,
            })
        }
    }

    async execute(call: ServerUnaryCall<ExecuteRequest, ExecuteReply>, callback: sendUnaryData<ExecuteReply>): Promise<void> {
        try {
            const keyProvider = new AleoKeyProvider();
            keyProvider.useCache(true)
            const private_key = call.request.privateKey
            const account = new Account({privateKey: private_key})
            const recordProvider = new NetworkRecordProvider(account, this.connect);
            const programManager = new ProgramManager(this.api_url, keyProvider, recordProvider);
            programManager.setAccount(account);
            const body = call.request.body
            const executionResponse = await programManager.execute({
                programName: body!.programName,
                functionName: body!.functionName,
                fee: body!.fee,
                privateFee: body!.privateFee,
                inputs: body!.inputs,
            })
            const reply = ExecuteReply.create()
            reply.result = executionResponse
            callback(null, reply)
        } catch (err: any) {
            console.error(err)
            callback({
                code: Status.UNKNOWN,
                message: err.message,
            })
        }
    }

    verify(call: ServerUnaryCall<VerifyRequest, VerifyReply>, callback: sendUnaryData<VerifyReply>): void {
        let reply = VerifyReply.create()
        reply.result = false
        try {
            const sign = Signature.from_string(call.request.sign)
            const encoder = new TextEncoder()
            const signMessage = encoder.encode(call.request.message)
            const address = Address.from_string(call.request.address)
            reply.result = sign.verify(address, signMessage)
            callback(null, reply)
        } catch (err: any) {
            callback(null, reply)
        }
    }

}

export {AleoService}

