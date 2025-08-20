use std::{mem::size_of};
use anchor_lang::prelude::*;
use anchor_lang::{
    solana_program::{
        program::invoke,
        pubkey::Pubkey,
        system_instruction::transfer,
    }
};
use anchor_spl::{
    token_interface::{Mint, TokenAccount, TokenInterface},
    token::{SyncNative, sync_native},
    associated_token::AssociatedToken
};
use orca_whirlpools_client::{SwapCpiBuilder};

declare_id!("HMdpAniwacxAdqJiSnjvTXNRyG5VHc8rzGKy2afyyT8C");

#[program]
pub mod coinswipedotsol {
    use super::*;

    const ADMIN_WALLET: Pubkey = pubkey!("AYoMJBzbH4yiw4YU3WrojnKUStecXZ2pYgwQi5rytech");

    pub fn initialize(ctx: Context<Initialize>, platform_wallet: Pubkey, platform_fee_per_10000: u64) -> Result<()> {
        require!(ADMIN_WALLET == *ctx.accounts.admin.key, ErrorCode::Unauthorized);

        let state = &mut ctx.accounts.state;
        state.bump = ctx.bumps.state;
        state.platform_wallet = platform_wallet;
        state.platform_fee_per_10000 = platform_fee_per_10000;
        state.platform_fee_collected = 0;

        msg!("Initialize: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn uninitialize(ctx: Context<Uninitialize>) -> Result<()> {
        require!(ADMIN_WALLET == *ctx.accounts.admin.key, ErrorCode::Unauthorized);

        msg!("Uninitialize: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn swipe_right(ctx: Context<SwipeRight>, amount: u64, sqrt_price_limit: u128) -> Result<()> {
        let state = &mut ctx.accounts.state;
        let platform_wallet = *ctx.accounts.platform_wallet.key;
        require!(state.platform_wallet == platform_wallet, ErrorCode::IncorrectPlatformWallet);

        let platform_fee = (amount * state.platform_fee_per_10000) / 10000;
        invoke(
            &transfer(
                &ctx.accounts.user.key(),
                &ctx.accounts.platform_wallet.key(),
                platform_fee,
            ),
            &[
                ctx.accounts.user.to_account_info().clone(),
                ctx.accounts.platform_wallet.clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ],
        )?;
        state.platform_fee_collected += platform_fee;

        let current_balance_wsol = ctx.accounts.wsol_token_account.amount;
		if amount > current_balance_wsol {
			let required_balance_wsol = amount - current_balance_wsol;
            msg!("delta: {0}", required_balance_wsol);
			
			invoke(
				&transfer(
					&ctx.accounts.user.key(),
					&ctx.accounts.wsol_token_account.key(),
					required_balance_wsol,
				),
				&[
					ctx.accounts.user.to_account_info().clone(),
					ctx.accounts.wsol_token_account.to_account_info().clone(),
					ctx.accounts.system_program.to_account_info().clone(),
				],
			)?;

            sync_native(CpiContext::new(
                ctx.accounts.wsol_token_program.to_account_info(),
                SyncNative {
                    account: ctx.accounts.wsol_token_account.to_account_info(),
                },
            ))?;
		}

        let amount_in = amount;
        let minimum_amount_out = 0;
        
        SwapCpiBuilder::new(&ctx.accounts.whirlpool_program.to_account_info())
            .token_program(&ctx.accounts.token_program.to_account_info())
            .token_authority(&ctx.accounts.user.to_account_info())
            .whirlpool(&ctx.accounts.whirlpool.to_account_info())
            .token_owner_account_a(&ctx.accounts.wsol_token_account.to_account_info())
            .token_vault_a(&ctx.accounts.token_vault_a.to_account_info())
            .token_owner_account_b(&ctx.accounts.token_owner_account_b.to_account_info())
            .token_vault_b(&ctx.accounts.token_vault_b.to_account_info())
            .tick_array0(&ctx.accounts.tick_array0.to_account_info())
            .tick_array1(&ctx.accounts.tick_array1.to_account_info())
            .tick_array2(&ctx.accounts.tick_array2.to_account_info())
            .oracle(&ctx.accounts.oracle.to_account_info())
            .amount(amount)
            .other_amount_threshold(0)
            .sqrt_price_limit(sqrt_price_limit)
            .a_to_b(true)
            .amount_specified_is_input(true)
            .invoke()?;

        msg!("Swipe Right: {:?}", ctx.program_id);

        Ok(())
    }
}


#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = size_of::<SwipeState>() + 8,
        seeds = [b"swipe"],
        bump)
    ]
    pub state: Account<'info, SwipeState>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Uninitialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        close = admin,
        seeds = [b"swipe"],
        bump)
    ]
    pub state: Account<'info, SwipeState>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SwipeRight<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut, seeds = ["swipe".as_bytes()], bump = state.bump)]
    pub state: Account<'info, SwipeState>,

    /// CHECK:
    #[account(mut)]
    pub platform_wallet: AccountInfo<'info>,

    pub system_program: Program<'info, System>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    /// SPL program for input token transfers
    pub wsol_token_program: Interface<'info, TokenInterface>,

    pub token_program: Interface<'info, TokenInterface>,

    /// CHECK:
    pub whirlpool_program: UncheckedAccount<'info>,

    /// CHECK: init by whirlpool
    #[account(mut)]
    pub whirlpool: UncheckedAccount<'info>,

    // #[account(
    //     init_if_needed,
    //     payer = admin,
    //     associated_token::mint = token_mint_b,
    //     associated_token::authority = receiver,
    // )]
    #[account(mut)]
    pub wsol_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK:
    // #[account(mut)]
    // pub token_owner_account_b: UncheckedAccount<'info>,
    // #[account(
    //     init_if_needed,
    //     payer = admin,
    //     associated_token::mint = token_mint_b,
    //     associated_token::authority = sender,
    // )]
    #[account(mut)]
    pub token_owner_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_mint_a: Box<InterfaceAccount<'info, Mint>>,

    pub token_mint_b: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: init by whirlpool
    #[account(mut)]
    pub token_vault_a: UncheckedAccount<'info>,

    /// CHECK: init by whirlpool
    #[account(mut)]
    pub token_vault_b: UncheckedAccount<'info>,

    /// CHECK:
    #[account(mut)]
    pub tick_array0: UncheckedAccount<'info>,

    /// CHECK:
    #[account(mut)]
    pub tick_array1: UncheckedAccount<'info>,

    /// CHECK:
    #[account(mut)]
    pub tick_array2: UncheckedAccount<'info>,

    /// CHECK:
    pub oracle: UncheckedAccount<'info>,
}

#[account]
pub struct SwipeState {
    bump: u8,
    pub platform_wallet: Pubkey,
    pub platform_fee_per_10000: u64,
    pub platform_fee_collected: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized admin as signer")]
    Unauthorized,
    #[msg("Incorrect platform wallet")]
    IncorrectPlatformWallet,
}