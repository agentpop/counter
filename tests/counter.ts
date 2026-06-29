import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";
import { assert } from "chai";

describe("counter", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.counter as Program<Counter>;
  const authority = provider.wallet.publicKey;

  const [counterPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), authority.toBuffer()],
    program.programId
  );

  it("initializes the counter at zero", async () => {
    await program.methods
      .initialize()
      .accounts({ authority })
      .rpc();

    const counter = await program.account.counter.fetch(counterPda);
    assert.strictEqual(counter.count.toNumber(), 0);
    assert.isTrue(counter.authority.equals(authority));
  });

  it("increments the counter", async () => {
    await program.methods
      .increment()
      .accounts({ authority })
      .rpc();

    const counter = await program.account.counter.fetch(counterPda);
    assert.strictEqual(counter.count.toNumber(), 1);
  });
});
