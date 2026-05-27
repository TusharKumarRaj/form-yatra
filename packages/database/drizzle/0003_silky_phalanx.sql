CREATE TYPE "public"."form_status" AS ENUM('PUBLISHED', 'UNPUBLISHED');--> statement-breakpoint
CREATE TYPE "public"."form_visibility" AS ENUM('PUBLIC', 'UNLISTED');--> statement-breakpoint
ALTER TABLE "form_fields" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."field_type_enum";--> statement-breakpoint
CREATE TYPE "public"."field_type_enum" AS ENUM('SHORT_TEXT', 'LONG_TEXT', 'EMAIL', 'NUMBER', 'SINGLE_SELECT', 'MULTI_SELECT', 'CHECKBOX', 'RATING', 'DATE');--> statement-breakpoint
ALTER TABLE "form_fields" ALTER COLUMN "type" SET DATA TYPE "public"."field_type_enum" USING "type"::"public"."field_type_enum";--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "visibility" "form_visibility" DEFAULT 'PUBLIC' NOT NULL;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "status" "form_status" DEFAULT 'UNPUBLISHED' NOT NULL;--> statement-breakpoint
ALTER TABLE "form_fields" ADD COLUMN "options" json;