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
  numeric,
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
export const swapPoolFiatDepositType = pgEnum("swap_pool_fiat_deposit_type", [
  "FIAT_DEPOSIT",
  "CRYPTO_DEPOSIT",
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

export const notificationKind = pgEnum("notification_kind", [
  "SYSTEM", // System-generated notifications
  "USER_MESSAGE", // Direct user-to-user messages
  "OFFERING_NEW", // New offering in your area/interests
  "OFFERING_UPDATE", // Offering you're watching was updated
  "FIELD_REPORT_NEW", // New field report
  "FIELD_REPORT_STATUS", // Field report status changed
  "GAS_GIFT_STATUS", // Gas gift status update
  "VOUCHER_NEW", // New voucher available
  "SWAP_POOL_UPDATE", // Swap pool updates
  "VERIFICATION_REQUEST", // Verification requested
  "ADMIN_NOTICE", // Administrative notices
]);

export const notificationStatus = pgEnum("notification_status", [
  "UNREAD",
  "READ",
  "ARCHIVED",
]);

export const notificationPriority = pgEnum("notification_priority", [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
]);

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

export const voucherIssuers = pgTable("voucher_issuers", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  voucherAddress: text("voucher_addr")
    .notNull()
    .references(() => vouchers.address, { onDelete: "cascade" }),
  issuerAddress: text("issuer_address")
    .notNull()
    .references(() => users.address, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
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
  defaultVoucherAddr: text("default_voucher_addr").references(
    () => vouchers.address,
    { onDelete: "set null" }
  ),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
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

// ---------------------------------------------------------------
// 8.  Notifications
// ---------------------------------------------------------------
export const notifications = pgTable(
  "notifications",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    recipientAddr: text("recipient_addr")
      .notNull()
      .references(() => users.address, { onDelete: "cascade" }),
    senderAddr: text("sender_addr").references(() => users.address, {
      onDelete: "set null",
    }),
    kind: notificationKind("kind").notNull(),
    status: notificationStatus("status").notNull().default("UNREAD"),
    priority: notificationPriority("priority").notNull().default("NORMAL"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    imageUrl: text("image_url"),
    actionUrl: text("action_url"), // Deep link or URL for action
    actionLabel: text("action_label"), // Button text like "View Offering"
    // Generic reference fields for linking to any entity
    refOfferingId: bigint("ref_offering_id", { mode: "number" }).references(
      () => offerings.id,
      { onDelete: "cascade" }
    ),
    refFieldReportId: bigint("ref_field_report_id", {
      mode: "number",
    }).references(() => fieldReports.id, { onDelete: "cascade" }),
    refVoucherAddr: text("ref_voucher_addr").references(
      () => vouchers.address,
      {
        onDelete: "cascade",
      }
    ),
    refSwapPoolAddr: text("ref_swap_pool_addr").references(
      () => swapPools.address,
      { onDelete: "cascade" }
    ),
    // Metadata
    metadata: text("metadata"), // JSON string for additional data
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Indexes for common queries
    uniqueIndex("idx_notifications_recipient_created").on(
      t.recipientAddr,
      t.createdAt
    ),
    uniqueIndex("idx_notifications_recipient_status").on(
      t.recipientAddr,
      t.status
    ),
    uniqueIndex("idx_notifications_kind_created").on(t.kind, t.createdAt),
  ]
);

// ---------------------------------------------------------------
// 9.  Donations & Fiat Origins
// ---------------------------------------------------------------
export const fiatOrigins = pgTable("fiat_origins", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  donorEmail: text("donor_email"),
  fiatReference: text("fiat_reference"),
  fiatCurrency: varchar("fiat_currency", { length: 10 }),
  fiatAmount: numeric("fiat_amount", { precision: 20, scale: 2 }),
  conversionRate: numeric("conversion_rate", { precision: 20, scale: 8 }),
  convertedTokenAddress: text("converted_token_address"),
  convertedAmount: numeric("converted_amount", { precision: 38, scale: 18 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const donations = pgTable("donations", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  txHash: text("tx_hash").unique(),
  donorAddress: text("donor_address").notNull(),
  tokenAddress: text("token_address").notNull(),
  amount: numeric("amount", { precision: 38, scale: 18 }).notNull(),
  fiatOriginId: integer("fiat_origin_id").references(() => fiatOrigins.id),
  purpose: text("purpose"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
