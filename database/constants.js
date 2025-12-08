export const QUERY_DROP_APPLICATION_TABLE = `
  DROP TABLE IF EXISTS applications;
`;

export const QUERY_DROP_TENANT_TABLE = `
  DROP TABLE IF EXISTS tenants;
`;

export const QUERY_DROP_USER_TABLE = `
  DROP TABLE IF EXISTS users;
`;

export const QUERY_DROP_API_KEYS_TABLE = `
  DROP TABLE IF EXISTS api_keys;
`;

export const QUERY_CREATE_APPLICATION_TABLE = `
    CREATE TABLE IF NOT EXISTS applications (
      id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name            text NOT NULL,
      key             text NOT NULL UNIQUE,
      is_multitenant  boolean NOT NULL DEFAULT false,
      created_at      timestamptz NOT NULL DEFAULT now(),
      updated_at      timestamptz NOT NULL,
      deleted_at      timestamptz
    );
  `;

export const QUERY_CREATE_TENANT_TABLE = `
  CREATE TABLE IF NOT EXISTS tenants (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id  uuid NOT NULL,
    name            text NOT NULL,
    domain          text NOT NULL,
    status          text NOT NULL DEFAULT 'active',
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL,
    deleted_at      timestamptz,

    CONSTRAINT tenants_application_fk
        FOREIGN KEY (application_id)
        REFERENCES applications(id)
        ON DELETE CASCADE
);`;

export const QUERY_CREATE_USER_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id  uuid NOT NULL,
    tenant_id       uuid NOT NULL,
    email           text NOT NULL UNIQUE,
    username        text NOT NULL UNIQUE,
    password_hash   text NOT NULL,
    first_name      text NOT NULL,
    last_name       text NOT NULL,
    status          text NOT NULL DEFAULT 'active',
    last_login_at   timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL,
    deleted_at      timestamptz,

    CONSTRAINT users_tenant_fk
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE CASCADE,

    CONSTRAINT users_application_fk
        FOREIGN KEY (application_id)
        REFERENCES applications(id)
        ON DELETE CASCADE
);`;

export const QUERY_CREATE_API_KEYS_TABLE = `
  CREATE TABLE IF NOT EXISTS api_keys (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name            text NOT NULL,
    key             text NOT NULL UNIQUE,
    application_id  uuid NOT NULL,
    tenant_id       uuid NOT NULL,
    status          text NOT NULL DEFAULT 'active',
    expires_at      timestamptz,
    last_used_at    timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL,
    deleted_at      timestamptz,
    
    CONSTRAINT api_keys_application_fk
        FOREIGN KEY (application_id)
        REFERENCES applications(id)
        ON DELETE SET NULL,
    CONSTRAINT api_keys_tenant_fk
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key) WHERE deleted_at IS NULL;
  CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status) WHERE deleted_at IS NULL;
`;