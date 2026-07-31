-- ResQ Database Migration
-- Run: npm run migrate

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(150) UNIQUE NOT NULL,
  phone     VARCHAR(20),
  role      VARCHAR(20) NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'dispatcher')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Responders table
CREATE TABLE IF NOT EXISTS responders (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  type       VARCHAR(50)  NOT NULL CHECK (type IN ('Paramedic', 'Firefighter', 'Police Officer')),
  phone      VARCHAR(20),
  status     VARCHAR(20)  NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'off_duty')),
  latitude   NUMERIC(10, 7),
  longitude  NUMERIC(10, 7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_responders_status ON responders(status);
CREATE INDEX IF NOT EXISTS idx_responders_type   ON responders(type);

-- Emergency requests table
CREATE TABLE IF NOT EXISTS emergency_requests (
  id                    SERIAL PRIMARY KEY,
  user_id               INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitude              NUMERIC(10, 7) NOT NULL,
  longitude             NUMERIC(10, 7) NOT NULL,
  description           TEXT NOT NULL,
  category              VARCHAR(50) NOT NULL CHECK (category IN ('Medical', 'Fire', 'Police')),
  priority              VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  recommended_responder VARCHAR(50),
  classification_source VARCHAR(20) NOT NULL DEFAULT 'rule_engine' CHECK (classification_source IN ('ai', 'rule_engine')),
  status                VARCHAR(20) NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'assigned', 'in_progress', 'resolved', 'cancelled')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_er_status    ON emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_er_priority  ON emergency_requests(priority);
CREATE INDEX IF NOT EXISTS idx_er_user_id   ON emergency_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_er_category  ON emergency_requests(category);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id           SERIAL PRIMARY KEY,
  request_id   INTEGER NOT NULL REFERENCES emergency_requests(id) ON DELETE CASCADE,
  responder_id INTEGER NOT NULL REFERENCES responders(id) ON DELETE CASCADE,
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes        TEXT
);

CREATE INDEX IF NOT EXISTS idx_assignments_request_id   ON assignments(request_id);
CREATE INDEX IF NOT EXISTS idx_assignments_responder_id ON assignments(responder_id);

-- Status history table
CREATE TABLE IF NOT EXISTS status_history (
  id          SERIAL PRIMARY KEY,
  request_id  INTEGER NOT NULL REFERENCES emergency_requests(id) ON DELETE CASCADE,
  old_status  VARCHAR(20),
  new_status  VARCHAR(20) NOT NULL,
  changed_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sh_request_id ON status_history(request_id);

-- System logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id         SERIAL PRIMARY KEY,
  event      VARCHAR(100) NOT NULL,
  payload    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_event      ON system_logs(event);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON system_logs(created_at DESC);
