ALTER TABLE "designs" ADD COLUMN IF NOT EXISTS "generated_prompt" text;
--> statement-breakpoint
ALTER TABLE "designs" ADD COLUMN IF NOT EXISTS "room_type" varchar(100);
--> statement-breakpoint
ALTER TABLE "designs" ADD COLUMN IF NOT EXISTS "lighting" varchar(100);
--> statement-breakpoint
ALTER TABLE "designs" ADD COLUMN IF NOT EXISTS "aspect_ratio" varchar(20);
--> statement-breakpoint
ALTER TABLE "designs" ADD COLUMN IF NOT EXISTS "provider" varchar(60);
--> statement-breakpoint
ALTER TABLE "designs" ADD COLUMN IF NOT EXISTS "model" varchar(120);
--> statement-breakpoint
ALTER TABLE "designs" ADD COLUMN IF NOT EXISTS "is_favorite" boolean DEFAULT false NOT NULL;
