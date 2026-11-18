CREATE TABLE IF NOT EXISTS supply_offal
(
    supply_id int NOT NULL REFERENCES supply(id),
    offal_id  int NOT NULL REFERENCES offal(id),
    quantity int NOT NULL DEFAULT(1),
    UNIQUE (supply_id, offal_id)
);