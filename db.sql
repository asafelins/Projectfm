create table users
(
    user_id       serial
        constraint users_pk
            primary key,
    username      text                  not null,
    password      text                  not null,
    email         text                  not null,
    creation_time timestamp             not null,
    token         text                  not null,
    admin         boolean default false not null,
    constraint users_pk_2
        unique (username, email)
);

create table films
(
    film_id        serial
        constraint films_pk
            primary key,
    film_name      text                                                    not null
        constraint films_pk_2
            unique,
    director       text                                                    not null,
    current_stock  integer                                                 not null,
    film_available boolean default true                                    not null
);

create table rental
(
    rental_id    serial
        constraint rental_pk
            primary key,
    film_id      integer not null
        constraint rental_films_film_id_fk
            references films,
    user_id      integer not null
        constraint rental_users_user_id_fk
            references users,
    initial_date date    not null,
    final_date   date    not null
);

--Username = admin, Senha = admin123
insert into users (username, password, email, creation_time, token, admin)
values ('admin', '$2a$11$tJPBDPtBKDgROwJ6k/0BBeK37Tzr5tpSrHr8tGIariGh7DiWL9r0.', 'admin@admin.com', NOW(), 'aSuGqXhuCPTdkAwBhBATJZTauC8AvZ1mpsReFogox9m5QKEVGMbg73mT6u8VnEim0l8t8aN3T0TT9OHvGpG6qEDPtQ8kPuALkwrPPfyUleU5GKXdQ9Dl4G7l4IpPCrOF', true)