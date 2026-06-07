-- migrations/001-simplify-schema.sql
CREATE TABLE documents_new (
    id TEXT NOT NULL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attributes TEXT,
    data TEXT
);

INSERT INTO documents_new (id, created_at, updated_at, attributes, data)
SELECT
    id,
    created_at,
    updated_at,
    json_patch(COALESCE(attributes, '{}'), json_object('name', name)),
    data
FROM documents;

DROP TABLE documents;
ALTER TABLE documents_new RENAME TO documents;
