-- Add format_urls and output_formats columns to the books table

alter table "public"."books"
add column "format_urls" jsonb;

alter table "public"."books"
add column "output_formats" text[];
