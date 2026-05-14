CREATE TABLE "creator_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"tagline" text,
	"bio" text,
	"avatar_url" text,
	"cover_url" text,
	"accent_color" text DEFAULT 'terracotta' NOT NULL,
	"kunu_price_kobo" integer DEFAULT 50000 NOT NULL,
	"kunu_label" text DEFAULT 'kunu' NOT NULL,
	"kunu_emoji" text DEFAULT '🥤' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"payout_bank_code" text,
	"payout_account_number" text,
	"payout_account_name" text,
	"payout_recipient_code" text,
	"bank_verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet_balance" (
	"creator_user_id" text PRIMARY KEY NOT NULL,
	"available_kobo" integer DEFAULT 0 NOT NULL,
	"pending_kobo" integer DEFAULT 0 NOT NULL,
	"lifetime_kobo" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creator_profile" ADD CONSTRAINT "creator_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_balance" ADD CONSTRAINT "wallet_balance_creator_user_id_user_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;