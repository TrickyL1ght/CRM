CREATE TABLE IF NOT EXISTS sales (
    id serial primary key,
    weight int not null,
    date bigint not null,
    LivestockType int references livestock_type(id),
    Offal int references offal(id)
)