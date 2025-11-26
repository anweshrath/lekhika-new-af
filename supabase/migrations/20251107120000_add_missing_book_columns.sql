alter table "public"."books"
add column "format_urls" jsonb;

alter table "public"."books"
add column "output_formats" text[];

alter table "public"."books"
add column "character_count" integer;
