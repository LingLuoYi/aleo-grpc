// @ts-ignore
import {Address} from "@provablehq/sdk";
import {PrivateKey, Signature} from "@provablehq/wasm";

// let public_connection = new AleoNetworkClient("https://api.explorer.provable.com/v1");
// const account = new Account({privateKey: "APrivateKey1zkp8i3t8Vp5GMbRtVjtzCUYxL4tkhdfAJxCTGSSXbTfsFzy"})
// const keyProvider = new AleoKeyProvider();
// const recordProvider = new NetworkRecordProvider(account, public_connection);
// const programManager = new ProgramManager("https://api.explorer.provable.com/v1", keyProvider, recordProvider);
// programManager.setAccount(account);
// programManager.transfer(1, "aleo1dtsh8xrm56pcnwt6kklmcfph2wcl9rwvhsek8h5um3un8u7x3gzsladpw5", "public", 1, false)
//     .then((res: any) => {
//         console.log(res)
//     })

const t = new TextEncoder()
const sar = t.encode("aaaaa")
const s = Signature.from_string("sign15k39u48j8z6m5gpxlh84hmtntzwf5r0huelukkd4ncyp86ufxsp38uhj9t3sgqa5a8nfnjy8tg6wsatr8hs3t5fhf0pwu4lkj57pvqy3x3wchxlfx4pkqhv4c696m53w85rmq0yanm0tuz3vv5nlc93fz26ltwmfnlrv3slpgpksydfywv5ucj2y8s0lsu6l69454puqvnzqxzd3j6t")
console.log("sign===>", s.to_string())
const address = Address.from_string("aleo18ankdmxqjt4mjlvgf5060ljhxpsfdattkh72sf8unw5m45hapy9svqfss8")
console.log("address=>>>",address.to_string())
const su = s.verify(address, sar)
console.log("success===>>>>",su)
