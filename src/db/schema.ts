// drizzle-orm schema definition – natural‑key version
// ---------------------------------------------------------------
//  Users   now use their *blockchain address* (text) as primary key
//  SwapPools likewise use their pool address as primary key
//  All foreign‑key columns updated accordingly
// ---------------------------------------------------------------
import {
  bigint,
  bigserial,
  boolean,
  integer,
  pgEnum,
  pgTable,
  point,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------
// 1.  ENUM types
// ---------------------------------------------------------------
export const userRole = pgEnum("user_role", [
  "USER",
  "ADMIN",
  "STAFF",
  "SUPER_ADMIN",
]);

export const genderKind = pgEnum("gender_kind", [
  "MALE",
  "FEMALE",
  "OTHER",
  "UNSPECIFIED",
]);
export const commodityKind = pgEnum("commodity_kind", ["GOOD", "SERVICE"]);
export const frequencyKind = pgEnum("frequency_kind", [
  "ONCE",
  "DAILY",
  "WEEKLY",
  "MONTHLY",
]);
export const reportStatus = pgEnum("report_status", [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
]);
export const voucherKind = pgEnum("voucher_kind", [
  "DEMURRAGE_ERC20",
  "ERC20",
  "EXPIRING_ERC20",
]);
export const gasGiftStatus = pgEnum("gas_gift_status", [
  "NONE",
  "PENDING",
  "APPROVED",
  "DECLINED",
]);
export const contactKind = pgEnum("contact_kind", ["EMAIL", "PHONE", "SOCIAL"]);

// ---------------------------------------------------------------
// 2.  Core tables
// ---------------------------------------------------------------
export const users = pgTable("users", {
  address: text("address").primaryKey(), // PK
  role: userRole("role").notNull().default("USER"),
  gasGiftStatus: gasGiftStatus("gas_gift_status").notNull().default("NONE"),
  gasApproverAddr: text("gas_approver_addr").references(() => users.address),
  defaultVoucherAddr: text("default_voucher_addr").references(
    () => vouchers.address
  ),
  activated: boolean("activated").notNull().default(false), // ??
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  userAddress: text("user_address")
    .primaryKey()
    .references(() => users.address, { onDelete: "cascade" }),
  yearOfBirth: integer("year_of_birth"),
  gender: genderKind("gender"),
  familyName: text("family_name"),
  givenNames: text("given_names"),
  locationName: text("location_name"),
  geo: point("geo"),
  languageCode: varchar("language_code", { length: 3 }).default("eng"),
  profilePictureUrl: text("profile_picture_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------
// 3.  Vouchers & issuers (unchanged)
// ---------------------------------------------------------------
export const vouchers = pgTable("vouchers", {
  address: text("address").primaryKey(),
  symbol: text("symbol").notNull(), // TODO: Should this just come from the chain?
  name: text("name").notNull(), // TODO: Should this just come from the chain?
  description: text("description").notNull(),
  sinkAddress: text("sink_address").notNull(), // TODO: Should this just come from the chain?
  kind: voucherKind("kind").notNull(),
  value: integer("value").notNull().default(10), // TODO: Where is this used
  uoa: text("uoa").notNull().default("KES"),
  internal: boolean("internal").notNull().default(false),
  iconUrl: text("icon_url"),
  bannerUrl: text("banner_url"),
  locationName: text("location_name"),
  geo: point("geo"),
  customTerms: text("custom_terms"),
  contractVersion: text("contract_version").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------
// 4.  Offerings
// ---------------------------------------------------------------

export const offerings = pgTable("offerings", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  kind: commodityKind("kind").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  sellerAddress: text("seller_address")
    .notNull()
    .references(() => users.address, { onDelete: "cascade" }),
  voucherAddr: text("voucher_addr")
    .notNull()
    .references(() => vouchers.address, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  frequency: frequencyKind("frequency").notNull(),
  price: integer("price").notNull().default(0),
  available: boolean("available").notNull().default(true),
  locationName: text("location_name"),
  geo: point("geo"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------
// 5.  Tags & field reports
// ---------------------------------------------------------------
export const tags = pgTable("tags", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  tag: text("tag").notNull().unique(),
});

export const fieldReports = pgTable("field_reports", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  locationName: text("location_name"),
  geo: point("geo"),
  periodFrom: timestamp("period_from", { withTimezone: true }),
  periodTo: timestamp("period_to", { withTimezone: true }),
  status: reportStatus("status").notNull().default("DRAFT"),
  rejectionReason: text("rejection_reason"),
  createdByAddr: text("created_by_addr")
    .notNull()
    .references(() => users.address),
  modifiedByAddr: text("modified_by_addr")
    .notNull()
    .references(() => users.address),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const fieldReportTags = pgTable(
  "field_report_tags",
  {
    reportId: bigint("report_id", { mode: "number" })
      .notNull()
      .references(() => fieldReports.id, { onDelete: "cascade" }),
    tagId: bigint("tag_id", { mode: "number" })
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.reportId, t.tagId] })]
);

export const fieldReportVouchers = pgTable(
  "field_report_vouchers",
  {
    reportId: bigint("report_id", { mode: "number" })
      .notNull()
      .references(() => fieldReports.id, { onDelete: "cascade" }),
    voucherAddr: text("voucher_addr")
      .notNull()
      .references(() => vouchers.address, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.reportId, t.voucherAddr] })]
);

export const fieldReportVerifications = pgTable(
  "field_report_verifications",
  {
    reportId: bigint("report_id", { mode: "number" })
      .notNull()
      .references(() => fieldReports.id, { onDelete: "cascade" }),
    userAddr: text("user_addr")
      .notNull()
      .references(() => users.address, { onDelete: "cascade" }),
    verifiedAt: timestamp("verified_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.reportId, t.userAddr] })]
);

// ---------------------------------------------------------------
// 6.  Swap pools & tags – address as PK
// ---------------------------------------------------------------
export const swapPools = pgTable("swap_pools", {
  address: text("address").primaryKey(),
  description: text("description").notNull(),
  bannerUrl: text("banner_url"),
  customTerms: text("custom_terms"),
});

export const swapPoolTags = pgTable(
  "swap_pool_tags",
  {
    poolAddress: text("pool_address")
      .notNull()
      .references(() => swapPools.address, { onDelete: "cascade" }),
    tagId: bigint("tag_id", { mode: "number" })
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.poolAddress, t.tagId] })]
);

// ---------------------------------------------------------------
// 7.  Contact‑info tables (updated FKs)
// ---------------------------------------------------------------
export const userContacts = pgTable(
  "user_contacts",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userAddress: text("user_address")
      .notNull()
      .references(() => users.address, { onDelete: "cascade" }),
    kind: contactKind("kind").notNull(),
    value: text("value").notNull(),
    platform: text("platform"),
    verified: boolean("verified").notNull().default(false),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("idx_user_contacts_unique").on(t.userAddress, t.kind, t.value),
  ]
);

export const voucherContacts = pgTable(
  "voucher_contacts",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    voucherAddr: text("voucher_addr")
      .notNull()
      .references(() => vouchers.address, { onDelete: "cascade" }),
    kind: contactKind("kind").notNull(),
    value: text("value").notNull(),
    platform: text("platform"),
    verified: boolean("verified").notNull().default(false),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("idx_voucher_contacts_unique").on(
      t.voucherAddr,
      t.kind,
      t.value
    ),
  ]
);

export const swapPoolContacts = pgTable(
  "swap_pool_contacts",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    poolAddress: text("pool_address")
      .notNull()
      .references(() => swapPools.address, { onDelete: "cascade" }),
    kind: contactKind("kind").notNull(),
    value: text("value").notNull(),
    platform: text("platform"),
    verified: boolean("verified").notNull().default(false),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("idx_swap_pool_contacts_unique").on(
      t.poolAddress,
      t.kind,
      t.value
    ),
  ]
);
