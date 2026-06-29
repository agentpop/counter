import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";

const EXPLORER = (sig: string) =>
  `https://explorer.solana.com/tx/${sig}?cluster=devnet`;

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.counter as Program<Counter>;
  const authority = provider.wallet.publicKey;

  const [counterPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), authority.toBuffer()],
    program.programId
  );

  console.log("Program:  ", program.programId.toBase58());
  console.log("Authority:", authority.toBase58());
  console.log("Counter PDA:", counterPda.toBase58());

  const existing = await program.account.counter.fetchNullable(counterPda);
  if (!existing) {
    const sig = await program.methods.initialize().accounts({ authority }).rpc();
    console.log("\ninitialize tx:", sig);
    console.log("   ", EXPLORER(sig));
  } else {
    console.log("\nCounter already initialized, count =", existing.count.toString());
  }

  const incSig = await program.methods.increment().accounts({ authority }).rpc();
  console.log("\nincrement tx:", incSig);
  console.log("   ", EXPLORER(incSig));

  const counter = await program.account.counter.fetch(counterPda);
  console.log("\nFinal on-chain count:", counter.count.toString());
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
