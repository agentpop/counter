use anchor_lang::prelude::*;

declare_id!("AVeouaE2zy1PUMuGGE8BzteuowxpCbshBHLqGGuzMPuk");

#[program]
pub mod counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.authority = ctx.accounts.authority.key();
        counter.count = 0;
        counter.bump = ctx.bumps.counter;

        emit!(CounterInitialized {
            authority: counter.authority,
            count: counter.count,
        });
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = counter
            .count
            .checked_add(1)
            .ok_or(CounterError::Overflow)?;

        emit!(CounterIncremented {
            authority: counter.authority,
            count: counter.count,
        });
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Counter::INIT_SPACE,
        seeds = [b"counter", authority.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(
        mut,
        has_one = authority @ CounterError::Unauthorized,
        seeds = [b"counter", authority.key().as_ref()],
        bump = counter.bump
    )]
    pub counter: Account<'info, Counter>,

    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub authority: Pubkey,
    pub count: u64,
    pub bump: u8,
}

#[event]
pub struct CounterInitialized {
    pub authority: Pubkey,
    pub count: u64,
}

#[event]
pub struct CounterIncremented {
    pub authority: Pubkey,
    pub count: u64,
}

#[error_code]
pub enum CounterError {
    #[msg("Arithmetic overflow occurred")]
    Overflow,
    #[msg("Unauthorized: caller is not the counter authority")]
    Unauthorized,
}
