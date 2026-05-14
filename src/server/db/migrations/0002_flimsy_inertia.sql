CREATE TYPE "public"."tip_status" AS ENUM('pending', 'paid', 'failed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."membership_interval" AS ENUM('monthly', 'annually');--> statement-breakpoint
CREATE TYPE "public"."sub_status" AS ENUM('active', 'non-renewing', 'attention', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('requested', 'processing', 'success', 'failed', 'reversed');--> statement-breakpoint
CREATE TABLE "tip" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_user_id" text NOT NULL,
	"supporter_user_id" text,
	"supporter_name" text,
	"supporter_email" text NOT NULL,
	"kunu_count" integer NOT NULL,
	"amount_kobo" integer NOT NULL,
	"fee_kobo" integer DEFAULT 0 NOT NULL,
	"net_kobo" integer NOT NULL,
	"message" text,
	"is_public" boolean DEFAULT true NOT NULL,
	"paystack_reference" text NOT NULL,
	"paystack_channel" text,
	"status" "tip_status" DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tip_paystack_reference_unique" UNIQUE("paystack_reference")
);
--> statement-breakpoint
CREATE TABLE "membership_tier" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price_kobo" integer NOT NULL,
	"interval" "membership_interval" DEFAULT 'monthly' NOT NULL,
	"perks" text[],
	"paystack_plan_code" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "membership_tier_paystack_plan_code_unique" UNIQUE("paystack_plan_code")
);
--> statement-breakpoint
CREATE TABLE "subscription_charge" (
	"id" text PRIMARY KEY NOT NULL,
	"subscription_id" text NOT NULL,
	"amount_kobo" integer NOT NULL,
	"paystack_reference" text NOT NULL,
	"paid_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_charge_paystack_reference_unique" UNIQUE("paystack_reference")
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_user_id" text NOT NULL,
	"supporter_user_id" text,
	"supporter_email" text NOT NULL,
	"tier_id" text NOT NULL,
	"paystack_subscription_code" text,
	"paystack_email_token" text,
	"paystack_customer_code" text,
	"status" "sub_status" DEFAULT 'active' NOT NULL,
	"current_period_end" timestamp,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_paystack_subscription_code_unique" UNIQUE("paystack_subscription_code")
);
--> statement-breakpoint
CREATE TABLE "payout" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_user_id" text NOT NULL,
	"amount_kobo" integer NOT NULL,
	"fee_kobo" integer DEFAULT 0 NOT NULL,
	"paystack_transfer_code" text,
	"paystack_reference" text NOT NULL,
	"status" "payout_status" DEFAULT 'requested' NOT NULL,
	"failure_reason" text,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payout_paystack_transfer_code_unique" UNIQUE("paystack_transfer_code"),
	CONSTRAINT "payout_paystack_reference_unique" UNIQUE("paystack_reference")
);
--> statement-breakpoint
ALTER TABLE "tip" ADD CONSTRAINT "tip_creator_user_id_user_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tip" ADD CONSTRAINT "tip_supporter_user_id_user_id_fk" FOREIGN KEY ("supporter_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_tier" ADD CONSTRAINT "membership_tier_creator_user_id_user_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_charge" ADD CONSTRAINT "subscription_charge_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscription"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_creator_user_id_user_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_supporter_user_id_user_id_fk" FOREIGN KEY ("supporter_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_tier_id_membership_tier_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."membership_tier"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout" ADD CONSTRAINT "payout_creator_user_id_user_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tips_creator_created_idx" ON "tip" USING btree ("creator_user_id","created_at");--> statement-breakpoint
CREATE INDEX "tips_status_idx" ON "tip" USING btree ("status");--> statement-breakpoint
CREATE INDEX "membership_tiers_creator_idx" ON "membership_tier" USING btree ("creator_user_id");--> statement-breakpoint
CREATE INDEX "subs_supporter_idx" ON "subscription" USING btree ("supporter_user_id");--> statement-breakpoint
CREATE INDEX "subs_creator_status_idx" ON "subscription" USING btree ("creator_user_id","status");--> statement-breakpoint
CREATE INDEX "payouts_creator_created_idx" ON "payout" USING btree ("creator_user_id","created_at");