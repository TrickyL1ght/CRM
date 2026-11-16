CREATE TABLE IF NOT EXISTS supply
(
    id SERIAL primary key,
    livestock_type int reference livestock_type(id) not null,
    date_of_receipt bigint not null,
    comming_from varchar(255) not null,
    weight int not null
    );
