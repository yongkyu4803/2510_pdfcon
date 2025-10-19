CREATE TABLE "pdfcon_conversions" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_size" integer NOT NULL,
	"status" varchar(20) NOT NULL,
	"input_url" text,
	"output_url" text,
	"method" varchar(20),
	"tokens" integer,
	"has_structured_data" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "pdfcon_document_data" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"conversion_id" varchar(21) NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pdfcon_document_data" ADD CONSTRAINT "pdfcon_document_data_conversion_id_pdfcon_conversions_id_fk" FOREIGN KEY ("conversion_id") REFERENCES "public"."pdfcon_conversions"("id") ON DELETE cascade ON UPDATE no action;