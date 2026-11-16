CREATE TABLE IF NOT EXISTS sales (
    id serial primary key,
    weight int not null,
    date bigint not null,
    livestock_type int references livestock_type(id),
    offal int references offal(id),
    supply_id int references supply(id) not null
)