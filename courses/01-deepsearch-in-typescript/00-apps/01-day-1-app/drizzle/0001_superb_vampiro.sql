CREATE TABLE IF NOT EXISTS "ai-app-template_user_request" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"requested_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"endpoint" varchar(255) NOT NULL
);
--> statement-breakpoint
DROP TABLE "ai-app-template_chat";--> statement-breakpoint
DROP TABLE "ai-app-template_message";--> statement-breakpoint
DROP TABLE "ai-app-template_request";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai-app-template_user_request" ADD CONSTRAINT "ai-app-template_user_request_user_id_ai-app-template_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ai-app-template_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_request_user_id_idx" ON "ai-app-template_user_request" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_request_requested_at_idx" ON "ai-app-template_user_request" USING btree ("requested_at");