CREATE TABLE IF NOT EXISTS supply
(
    id SERIAL primary key,
    livestock_type varchar(25) not null,
    date_of_receipt bigint not null,
    comming_from varchar(255) not null,
    weight int not null
    );
