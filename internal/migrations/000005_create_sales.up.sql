CREATE TABLE IF NOT EXISTS sales (
    id serial primary key,
    weight int not null,
    date bigint not null,
    supply_id int not null references supply(id)
)